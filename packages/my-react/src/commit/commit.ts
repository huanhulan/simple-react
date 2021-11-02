import { is, isNil } from 'ramda';
import { mutables, reset } from '../mutables';
import { TEXT_ELEMENT, EFFECT_TAG } from '../constants';
import { updateDom } from './updateDom';
import { cancelEffects, runEffects } from '../hooks';
import { getChildFibers, enqueueMove } from '../libs';

function applyRef<T>(ref: Ref<T>, value: T) {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }
  ref.current = value;
}

function downToFindFibersWithDom(fiber: Fiber): Fiber[] {
  const children = getChildFibers(fiber);
  return children
    .map((fib) => {
      if (fib?.dom) {
        return [fib];
      }
      return downToFindFibersWithDom(fib);
    })
    .flat();
}

function sortDom([fiber, childrenNodes]: [Fiber, Node[]]) {
  const { dom: parentDom } = fiber;
  childrenNodes.forEach((node) => parentDom?.appendChild(node as HTMLElement));
}

function commitDeletion(fiber: Fiber, container: Node) {
  if (fiber.ref) {
    applyRef(fiber.ref, null);
  }

  if (
    fiber.dom &&
    Array.from(container.childNodes).includes(fiber.dom as any)
  ) {
    fiber.dom?.parentElement?.removeChild(fiber.dom);
  }
  cancelEffects(fiber);
  if (!fiber.child) {
    return;
  }
  mutables.deletions = mutables.deletions.filter(
    (fiberToDelete) => fiberToDelete !== fiber
  );

  getChildFibers(fiber).forEach((fib) => commitDeletion(fib, container));
}

export function createDom(fiber: Fiber): Node {
  if (!is(String, fiber.type)) {
    throw new Error('createDom can only accept string type');
  }
  const dom =
    fiber.type === TEXT_ELEMENT
      ? document.createTextNode('')
      : document.createElement(fiber.type as string);
  updateDom(
    dom,
    {
      children: [],
    },
    fiber.props
  );
  return dom;
}

function findFiberWithDom(fiber?: Fiber): Fiber {
  if (!fiber?.dom) {
    return findFiberWithDom(fiber?.parent);
  }
  return fiber;
}

// Fibers that are not dom elements who need to wait for all its children tree to be created to run effects
let waitForChildrenFibers: Fiber[] = [];

/**
 * We are also walking the whole tree in the commit phase.
 * React keeps a linked list with just the fibers that have effects and only visit those fibers.
 */
export function commitWork(fiber?: Fiber) {
  if (!fiber) {
    return;
  }

  const parentFiberWithDom = findFiberWithDom(fiber.parent);
  const childrenFibersWithDom = downToFindFibersWithDom(parentFiberWithDom);
  const { dom: domParent } = parentFiberWithDom;

  if (!domParent) {
    // eslint-disable-next-line
    throw new Error("Can't find a container element");
  }

  if (fiber.effectTag === EFFECT_TAG.PLACEMENT) {
    if (!isNil(fiber.dom)) {
      domParent.appendChild(fiber.dom);

      if (
        childrenFibersWithDom.indexOf(fiber) !==
        Array.from((domParent as HTMLElement).children).indexOf(
          fiber.dom as HTMLElement
        )
      ) {
        enqueueMove(
          parentFiberWithDom,
          childrenFibersWithDom.map(({ dom }) => dom) as Node[]
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
    if (!isNil(fiber.dom)) {
      cancelEffects(fiber);
      updateDom(fiber.dom, (fiber.alternate as Fiber).props, fiber.props);
      if (fiber.ref) {
        applyRef(fiber.ref, fiber.dom);
      }
      runEffects(fiber);
    }
    if (is(Function, fiber.type)) {
      waitForChildrenFibers.push(fiber);
    }
  } else if (fiber.effectTag === EFFECT_TAG.DELETION) {
    if (fiber.ref) {
      applyRef(fiber.ref, null);
    }
    cancelEffects(fiber);
    commitDeletion(fiber, domParent);
    return;
  }

  commitWork(fiber.child);
  if (waitForChildrenFibers.includes(fiber)) {
    if (fiber.effectTag === EFFECT_TAG.UPDATE) {
      cancelEffects(fiber);
    }
    runEffects(fiber);
    waitForChildrenFibers = waitForChildrenFibers.filter((f) => f !== fiber);
  }
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
