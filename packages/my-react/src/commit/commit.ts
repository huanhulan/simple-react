import { is, isNil } from 'ramda';
import { Ref, Fiber } from '../../typings';
import { mutables, reset } from '../mutables';
import { TEXT_ELEMENT, EFFECT_TAG } from '../constants';
import { updateDom } from './updateDom';
import {
  cancelEffects,
  runEffects,
  cancelLayoutEffects,
  runLayoutEffects,
} from '../hooks';
import {
  getChildFibers,
  enqueueMove,
  downToFindFibersWithDom,
  findParentFiberWithDom,
} from '../utils';

function applyRef<T>(ref: Ref<T>, value: T) {
  if (!ref) {
    return;
  }
  if (typeof ref === 'function') {
    ref(value);
    return;
  }
  ref.current = value;
}

function sortDom([fiber, childrenNodes]: [Fiber, Node[]]) {
  const { dom: parentDom } = fiber;
  childrenNodes.forEach((node) => parentDom?.appendChild(node as HTMLElement));
}

function commitDeletion(
  fiber: Fiber,
  containerDOM: Node,
  pendingDeletionEffect: Fiber[],
) {
  pendingDeletionEffect.push(fiber);
  if (fiber.ref) {
    applyRef(fiber.ref, null);
  }

  if (
    !fiber.isPortal &&
    fiber.dom &&
    Array.from(containerDOM.childNodes).includes(fiber.dom as any)
  ) {
    fiber.dom?.parentElement?.removeChild(fiber.dom);
  }
  cancelLayoutEffects(fiber);

  if (!fiber.child) {
    return;
  }

  getChildFibers(fiber).forEach((fib) =>
    commitDeletion(
      fib,
      fiber.isPortal ? (fiber.dom as HTMLElement) : containerDOM,
      pendingDeletionEffect,
    ),
  );
}

export function createDom(fiber: Fiber): Node {
  if (!is(String, fiber.type)) {
    throw new Error('createDom can only accept string type');
  }
  const dom =
    fiber.type === TEXT_ELEMENT
      ? document.createTextNode('')
      : document.createElement(fiber.type as string);
  if (process.env.NODE_ENV !== 'production') {
    dom['$$my_react-fiber'] = fiber;
  }
  updateDom(
    dom,
    {
      children: [],
    },
    fiber.props,
  );
  return dom;
}

/**
 * We are also walking the whole tree in the commit phase.
 * React keeps a linked list with just the fibers that have effects and only visit those fibers.
 */
export function commitWork() {
  const { wipRoot } = mutables;
  const { pendingEffectsMax, pendingEffectsMin } = mutables;
  const effectFibersReversed: Fiber[] = [];
  const effectFibers: Fiber[] = [];
  if (!wipRoot?.child) {
    return {
      effectFibersReversed,
      effectFibers,
    };
  }
  while (pendingEffectsMax.length) {
    const fiber = pendingEffectsMax.shift();
    if (!fiber) {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (fiber.effectTag === EFFECT_TAG.UPDATE) {
      cancelLayoutEffects(fiber);
    }
    effectFibersReversed.push(fiber);
  }
  while (pendingEffectsMin.length) {
    const fiber = pendingEffectsMin.shift();
    if (!fiber) {
      // eslint-disable-next-line no-continue
      continue;
    }
    effectFibers.push(fiber);
    const parentFiberWithDom = findParentFiberWithDom(fiber.parent);
    const childrenFibersWithDom = downToFindFibersWithDom(parentFiberWithDom);
    const { dom: domParent } = parentFiberWithDom;

    if (!domParent) {
      // eslint-disable-next-line
      throw new Error("Can't find a container element");
    }

    if (
      fiber.effectTag === EFFECT_TAG.PLACEMENT &&
      !isNil(fiber.dom) &&
      !fiber.isPortal
    ) {
      domParent.appendChild(fiber.dom);

      if (
        childrenFibersWithDom.indexOf(fiber) !==
        Array.from((domParent as HTMLElement).children).indexOf(
          fiber.dom as HTMLElement,
        )
      ) {
        enqueueMove(
          parentFiberWithDom,
          childrenFibersWithDom.map(({ dom }) => dom) as Node[],
        );
      }

      if (fiber.ref) {
        applyRef(fiber.ref, fiber.dom);
      }
    } else if (fiber.effectTag === EFFECT_TAG.UPDATE) {
      if (!isNil(fiber.dom)) {
        updateDom(fiber.dom, (fiber.alternate as Fiber).props, fiber.props);
        if (fiber.ref) {
          applyRef(fiber.ref, fiber.dom);
        }
      }
    }
  }
  effectFibersReversed.forEach((fiber) => {
    runLayoutEffects(fiber);
  });

  return {
    effectFibersReversed,
    effectFibers,
  };
}

function commitDelete() {
  const { fibersToDelete } = mutables;
  const pendingDeletionEffect: Fiber[] = [];
  while (fibersToDelete.array.length) {
    const fiber = fibersToDelete.remove();
    // eslint-disable-next-line
    if (!fiber || (fiber as any).deleted) {
      // eslint-disable-next-line no-continue
      continue;
    }
    // eslint-disable-next-line
    (fiber as any).deleted = true;
    const parentFiberWithDom = findParentFiberWithDom(fiber.parent);
    const { dom: domParent } = parentFiberWithDom;
    commitDeletion(fiber, domParent as Node, pendingDeletionEffect);
  }
  fibersToDelete.reset();
  return pendingDeletionEffect;
}

export function commitRoot() {
  const { moves, wipRoot } = mutables;
  const pendingDeletionEffect = commitDelete();
  const { effectFibersReversed } = commitWork();
  moves.forEach(sortDom);
  // cleanup
  mutables.currentRoot = wipRoot;
  reset(['currentRoot', 'nextUnitOfWork']);
  requestAnimationFrame(() => {
    pendingDeletionEffect.forEach((fiber) => {
      cancelEffects(fiber);
    });
    effectFibersReversed.forEach((fiber) => {
      cancelEffects(fiber);
    });
    effectFibersReversed.forEach((fiber) => {
      runEffects(fiber);
    });
  });
}
