import mitt from 'mitt';
import { curry, omit } from 'ramda';
import { Fiber } from '../typings';
import { Heap } from './libs';

const emitter = mitt();
export const evt = 'rerender';

export const onRerender: (cb: () => void) => void = curry(emitter.on)(
  evt as any,
);
export const rerender = (sync?: boolean) => emitter.emit(evt, sync);

const compareFiberAscend = (l: Fiber, r: Fiber) => {
  if (l.weight[0] === r.weight[0]) {
    return l.weight[1] - r.weight[1];
  }
  return l.weight[0] - r.weight[0];
};

export const getInitialValue = () =>
  ({
    nextUnitOfWork: undefined,
    // work in progress root or wipRoot, keep track of the root of the fiber tree
    wipRoot: undefined,
    wipFiber: undefined,
    // save a reference to that "last fiber tree we committed to the DOM" after we finish a commit.
    currentRoot: undefined,
    // keep track of the nodes we want to remove
    fibersToDelete: new Heap(compareFiberAscend),
    pendingEffectsMin: [],
    pendingEffectsMax: [],
    moves: [],
  } as {
    nextUnitOfWork?: Fiber;
    wipRoot?: Fiber;
    wipFiber?: Fiber;
    currentRoot?: Fiber;
    fibersToDelete: Heap<Fiber>;
    pendingEffectsMin: Array<Fiber>;
    pendingEffectsMax: Array<Fiber>;
    moves: Array<[Fiber, Node[]]>;
  });

export const mutables = getInitialValue();

class PendingFibers {
  private queue = new Heap(compareFiberAscend);

  enqueue(fiber: Fiber, shouldRenderImmediately = false) {
    this.queue.add(fiber);
    rerender(shouldRenderImmediately);
  }

  hasPendingFibers() {
    return !!this.queue.size;
  }

  get head(): Fiber<any> {
    return this.queue.peek;
  }

  consume() {
    const res = this.head;
    this.queue.remove();
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
