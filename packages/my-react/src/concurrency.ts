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

let scheduled: Promise<void> | undefined;

export function process() {
  performWorkSync();
  // once we finish all the work we commit the whole fiber tree to the DOM.
  if (!mutables.nextUnitOfWork && mutables.wipRoot) {
    commitRoot();
  }
  scheduled = undefined;
}

const workLoop = (sync?: boolean) => {
  if (scheduled) {
    return;
  }
  if (sync) {
    process();
    return;
  }
  scheduled = Promise.resolve().then(process);
};

onRerender(workLoop);
