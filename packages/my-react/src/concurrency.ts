import { commitRoot } from './commit';
import { mutables, onRerender, pendingFibers, transaction } from './mutables';
import { performUnitOfWork } from './reconciliation';

function performWorkSync(deadline?: IdleDeadline) {
  if (!mutables.nextUnitOfWork) {
    if (mutables.wipRoot) {
      commitRoot();
    }
    transaction.id = undefined;

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
  if (transaction.id) {
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
  transaction.id = requestIdleCallback(performWorkSync as () => void);
}

onRerender(workLoop);
