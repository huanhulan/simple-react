import { isNil } from 'ramda';
import { mutables } from './mutables';

function findParentWithDom(childFiber: Fiber): Fiber {
  if (!childFiber?.dom) {
    return findParentWithDom(childFiber.parent as Fiber);
  }
  return childFiber.parent as Fiber;
}

function commitDeletion(fiber: Fiber, container: HTMLElement) {
  if (fiber.dom) {
    container.removeChild(fiber.dom);
    return;
  }
  if (!fiber.child) {
    return;
  }
  commitDeletion(fiber.child, container);
}

function updateDom(
  fiberDom: HTMLElement,
  prevProps?: Fiber['props'],
  nextProps?: Fiber['props']
) {
  // TODO
}

export function commitWork(fiber?: Fiber) {
  if (!fiber) {
    return;
  }

  const { dom: domParent } = findParentWithDom(fiber);

  if (!fiber.dom) {
    commitDeletion(fiber, domParent as HTMLElement);
  }

  switch (fiber.effectTag) {
    case 'PLACEMENT': {
      domParent?.appendChild(fiber.dom as HTMLElement);
      break;
    }
    case 'UPDATE': {
      updateDom(fiber.dom as HTMLElement, fiber.alternate?.props, fiber.props);
      break;
    }
    default:
    case 'DELETION': {
      commitDeletion(fiber, domParent as HTMLElement);
    }
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

export function createDom(fiber: Fiber): HTMLElement {
  // TODO
  return document.createElement('div');
}

function walkFiberTree(fiber?: Fiber): Fiber | undefined {
  if (!fiber) {
    return fiber;
  }
  if (fiber.sibling) {
    return fiber.sibling;
  }
  return walkFiberTree(fiber.parent);
}

export function performUnitOfWork(fiber: Fiber) {
  if (isNil(fiber.dom)) {
    fiber.dom = createDom(fiber);
  }
  if (!isNil(fiber.parent)) {
    fiber.parent?.dom?.appendChild(fiber.dom);
  }
  const { children } = fiber.props;
  const childFibers = children.map(
    (element) =>
      ({
        type: element.type,
        props: element.props,
        parent: fiber,
      } as Fiber)
  );

  childFibers.forEach((childFiber, idx) => {
    const next = childFibers[idx + 1];
    if (next) {
      childFiber.sibling = next;
    }
  });

  // eslint-disable-next-line
  fiber.child = childFibers[0];

  if (fiber.child) {
    return fiber.child;
  }

  return walkFiberTree(fiber);
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
