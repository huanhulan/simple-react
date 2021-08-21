import { isNil } from 'ramda';
import { mutables } from '../mutables';
import { TEXT_ELEMENT, EFFECT_TAG } from '../constants';
import { updateDom } from './updateDom';
import { commitDeletion } from './commitDeletion';

export function createDom(fiber: Fiber): Node {
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

/**
 * We are also walking the whole tree in the commit phase.
 * React keeps a linked list with just the fibers that have effects and only visit those fibers.
 */
export function commitWork(fiber?: Fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber?.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === EFFECT_TAG.PLACEMENT && !isNil(fiber.dom)) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === EFFECT_TAG.UPDATE && !isNil(fiber.dom)) {
    updateDom(fiber.dom, (fiber.alternate as Fiber).props, fiber.props);
  } else if (fiber.effectTag === EFFECT_TAG.DELETION) {
    commitDeletion(fiber, domParent);
    return;
  }

  commitWork(fiber.child);
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
