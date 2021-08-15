import { mutables } from './mutables';
import { performUnitOfWork, commitRoot } from './reconciliation';

function performWorkSync(deadline: IdleDeadline) {
  if (!mutables.nextUnitOfWork || deadline.timeRemaining() < 1) {
    return;
  }
  mutables.nextUnitOfWork = performUnitOfWork(mutables.nextUnitOfWork);
  performWorkSync(deadline);
}

export function workLoop(deadline: IdleDeadline) {
  performWorkSync(deadline);
  // once we finish all the work we commit the whole fiber tree to the DOM.
  if (!mutables.nextUnitOfWork && mutables.wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}
