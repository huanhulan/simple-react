import { mutables } from '../mutables';
import { TEXT_ELEMENT, EFFECT_TAG } from '../constants';
import { updateDom } from './updateDom';
import { commitDeletion } from './commitDeletion';

function findParentWithDom(childFiber: Fiber): Fiber {
  if (!childFiber?.dom) {
    return findParentWithDom(childFiber.parent as Fiber);
  }
  return childFiber.parent as Fiber;
}

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

  const { dom: domParent } = findParentWithDom(fiber);

  if (!fiber.dom) {
    commitDeletion(fiber, domParent as HTMLElement);
  }

  switch (fiber.effectTag) {
    case EFFECT_TAG.PLACEMENT: {
      domParent?.appendChild(fiber.dom as HTMLElement);
      break;
    }
    case EFFECT_TAG.UPDATE: {
      updateDom(
        fiber.dom as HTMLElement,
        (fiber.alternate as Fiber).props,
        fiber.props
      );
      break;
    }
    default:
    case EFFECT_TAG.DELETION: {
      commitDeletion(fiber, domParent as HTMLElement);
      return;
    }
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
