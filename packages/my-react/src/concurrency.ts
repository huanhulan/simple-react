import { mutables, onRerender } from './mutables';
import { performUnitOfWork } from './reconciliation';
import { commitRoot } from './commit';

function performWorkSync() {
  if (!mutables.nextUnitOfWork) {
    return;
  }
  mutables.nextUnitOfWork = performUnitOfWork(mutables.nextUnitOfWork);
  performWorkSync();
}

let scheduled = false;

export function process() {
  performWorkSync();
  // once we finish all the work we commit the whole fiber tree to the DOM.
  if (!mutables.nextUnitOfWork && mutables.wipRoot) {
    commitRoot();
  }
  scheduled = false;
}

const workLoop = (sync?: boolean) => {
  if (scheduled) {
    return;
  }
  scheduled = true;
  if (sync) {
    process();
    return;
  }
  requestIdleCallback(process);
};

onRerender(workLoop);
