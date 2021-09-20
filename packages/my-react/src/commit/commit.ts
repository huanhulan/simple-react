import { is, isNil } from 'ramda';
import { mutables } from '../mutables';
import { TEXT_ELEMENT, EFFECT_TAG } from '../constants';
import { updateDom } from './updateDom';
import { commitDeletion } from './commitDeletion';
import { cancelEffects, runEffects } from '../hooks';

function applyRef<T>(ref: Ref<T>, value: T) {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }
  ref.current = value;
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

  const { dom: domParent } = findFiberWithDom(fiber.parent);

  if (!domParent) {
    // eslint-disable-next-line
    throw new Error("Can't find a container element");
  }

  if (fiber.effectTag === EFFECT_TAG.PLACEMENT) {
    if (!isNil(fiber.dom)) {
      domParent.appendChild(fiber.dom);
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
  const { deletions, wipRoot } = mutables;
  deletions.forEach(commitWork);
  if (wipRoot?.child) {
    commitWork(wipRoot.child);
  }
  mutables.currentRoot = wipRoot;
  mutables.wipRoot = undefined;
}
