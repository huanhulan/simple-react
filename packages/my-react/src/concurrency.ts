import { mutables } from './mutables';
import { performUnitOfWork, commitRoot } from './Reconciliation';

export function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (mutables.nextUnitOfWork && !shouldYield) {
    mutables.nextUnitOfWork = performUnitOfWork(mutables.nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!mutables.nextUnitOfWork && mutables.wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}
