import mitt from 'mitt';
import { curry, omit } from 'ramda';
import { Fiber } from '../typings';

const emitter = mitt();
export const evt = 'rerender';

export const onRerender: (cb: () => void) => void = curry(emitter.on)(
  evt as any,
);
export const rerender = (sync?: boolean) => emitter.emit(evt, sync);

export const getInitialValue = () =>
  ({
    nextUnitOfWork: undefined,
    // work in progress root or wipRoot, keep track of the root of the fiber tree
    wipRoot: undefined,
    wipFiber: undefined,
    // save a reference to that "last fiber tree we committed to the DOM" after we finish a commit.
    currentRoot: undefined,
    // keep track of the nodes we want to remove
    deletions: [],
    moves: [],
  } as {
    nextUnitOfWork?: Fiber;
    wipRoot?: Fiber;
    wipFiber?: Fiber;
    currentRoot?: Fiber;
    deletions: Fiber[];
    moves: Array<[Fiber, Node[]]>;
  });

export const mutables = getInitialValue();

class PendingFibers {
  private queue: Fiber[] = [];

  enqueue(fiber: Fiber, shouldRenderImmediately = false) {
    if (!this.queue.includes(fiber)) {
      this.queue.push(fiber);
    }
    rerender(shouldRenderImmediately);
  }

  hasPendingFibers() {
    return !!this.queue.length;
  }

  get head(): Fiber<any> {
    return this.queue[0];
  }

  consume() {
    const res = this.head;
    this.queue.shift();
    return res;
  }
}

export const pendingFibers = new PendingFibers();

export function reset(omitKeys: string[] = []) {
  Object.assign(mutables, omit(omitKeys, getInitialValue()));
}

if (process.env.NODE_ENV !== 'production') {
  window['$$my_react-mutables'] = mutables;
}
