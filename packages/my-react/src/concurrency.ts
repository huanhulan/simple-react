import { mutables, onRerender } from './mutables';
import { performUnitOfWork } from './reconciliation';
import { commitRoot } from './commit';

let scheduled: number | undefined;

function performWorkSync(deadline?: IdleDeadline) {
  if (!mutables.nextUnitOfWork) {
    if (mutables.wipRoot) {
      commitRoot();
    }
    scheduled = undefined;
    return;
  }
  if (deadline && deadline.timeRemaining() < 1) {
    requestIdleCallback(performWorkSync);
    return;
  }
  mutables.nextUnitOfWork = performUnitOfWork(mutables.nextUnitOfWork);
  performWorkSync();
}

export const workLoop = (sync?: boolean) => {
  if (scheduled) {
    return;
  }
  if (sync) {
    performWorkSync();
    return;
  }
  scheduled = requestIdleCallback(performWorkSync as () => void);
};

onRerender(workLoop);
