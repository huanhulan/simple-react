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

function findFiberWithDom(fiber?: Fiber): Fiber {
  if (!fiber?.dom) {
    return findFiberWithDom(fiber?.parent);
  }
  return fiber;
}

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
