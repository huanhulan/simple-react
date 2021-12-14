import { commitRoot } from './commit';
import { mutables, onRerender, pendingFibers } from './mutables';
import { performUnitOfWork } from './reconciliation';

let scheduled: number | undefined;

function performWorkSync(deadline?: IdleDeadline) {
  if (!mutables.nextUnitOfWork) {
    if (mutables.wipRoot) {
      commitRoot();
    }
    scheduled = undefined;

    if (pendingFibers.hasPendingFibers()) {
      // eslint-disable-next-line no-use-before-define
      workLoop(true);
    }
    return;
  }
  if (deadline && deadline.timeRemaining() < 1) {
    requestIdleCallback(performWorkSync);
    return;
  }
  mutables.nextUnitOfWork = performUnitOfWork(mutables.nextUnitOfWork);
  performWorkSync();
}

export function workLoop(sync?: boolean) {
  if (scheduled) {
    return;
  }

  const nextUnitOfWork = pendingFibers.consume();
  if (!nextUnitOfWork) {
    return;
  }
  mutables.nextUnitOfWork = nextUnitOfWork;

  if (sync) {
    performWorkSync();
    return;
  }
  scheduled = requestIdleCallback(performWorkSync as () => void);
}

onRerender(workLoop);
