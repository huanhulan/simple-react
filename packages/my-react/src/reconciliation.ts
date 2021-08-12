import { mutables } from './mutables';

export function commitWork(fiber: Fiber) {
  // TODO
}

export function createDom(fiber: Fiber): HTMLElement {
  // TODO
  return document.createElement('div');
}

export function performUnitOfWork(fiber: Fiber): Fiber {
  // TODO
  return fiber;
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
