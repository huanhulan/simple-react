import { is, isNil } from 'ramda';
import { Ref, Fiber } from '../../typings';
import { mutables, reset } from '../mutables';
import { TEXT_ELEMENT, EFFECT_TAG } from '../constants';
import { updateDom } from './updateDom';
import { cancelEffects, runEffects } from '../hooks';
import {
  getChildFibers,
  enqueueMove,
  downToFindFibersWithDom,
  findParentFiberWithDom,
} from '../libs';

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

function commitDeletion(fiber: Fiber, containerDOM: Node) {
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
  cancelEffects(fiber);

  mutables.deletions = mutables.deletions.filter(
    (fiberToDelete) => fiberToDelete !== fiber,
  );

  if (!fiber.child) {
    return;
  }

  getChildFibers(fiber).forEach((fib) =>
    commitDeletion(
      fib,
      fiber.isPortal ? (fiber.dom as HTMLElement) : containerDOM,
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

// Fibers that are not dom elements who need to wait for all its children tree to be created to run effects
let waitForChildrenFibers: Fiber[] = [];

function runPendingEffectsSync(fiber: Fiber) {
  if (waitForChildrenFibers.includes(fiber)) {
    if (fiber.effectTag === EFFECT_TAG.UPDATE) {
      cancelEffects(fiber);
    }
    runEffects(fiber);
    waitForChildrenFibers = waitForChildrenFibers.filter((f) => f !== fiber);
  }
}

/**
 * We are also walking the whole tree in the commit phase.
 * React keeps a linked list with just the fibers that have effects and only visit those fibers.
 */
export function commitWork(fiber?: Fiber) {
  if (!fiber) {
    return;
  }

  const parentFiberWithDom = findParentFiberWithDom(fiber.parent);
  const childrenFibersWithDom = downToFindFibersWithDom(parentFiberWithDom);
  const { dom: domParent } = parentFiberWithDom;

  if (!domParent) {
    // eslint-disable-next-line
    throw new Error("Can't find a container element");
  }

  if (fiber.effectTag === EFFECT_TAG.PLACEMENT) {
    if (!isNil(fiber.dom) && !fiber.isPortal) {
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
      runEffects(fiber);
    }
    if (is(Function, fiber.type)) {
      waitForChildrenFibers.push(fiber);
    }
  } else if (fiber.effectTag === EFFECT_TAG.UPDATE) {
    if (is(Function, fiber.type)) {
      waitForChildrenFibers.push(fiber);
    } else if (!isNil(fiber.dom)) {
      cancelEffects(fiber);
      updateDom(fiber.dom, (fiber.alternate as Fiber).props, fiber.props);
      if (fiber.ref) {
        applyRef(fiber.ref, fiber.dom);
      }
      runEffects(fiber);
    }
  } else if (fiber.effectTag === EFFECT_TAG.DELETION) {
    if (fiber.ref) {
      applyRef(fiber.ref, null);
    }
    commitDeletion(fiber, domParent);
    return;
  }

  // DFS
  commitWork(fiber.child);
  runPendingEffectsSync(fiber);
  commitWork(fiber.sibling);
}

export function commitRoot() {
  const { deletions, moves, wipRoot } = mutables;
  deletions.forEach(commitWork);
  if (wipRoot?.child) {
    commitWork(wipRoot.child);
  }
  moves.forEach(sortDom);
  // cleanup
  mutables.currentRoot = wipRoot;
  reset(['currentRoot', 'nextUnitOfWork']);
}
