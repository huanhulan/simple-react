import { isNil } from 'ramda';
import { mutables } from './mutables';

export function commitWork(fiber: Fiber) {
  // TODO
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
