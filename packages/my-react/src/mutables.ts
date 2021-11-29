import mitt from 'mitt';
import { curry, omit } from 'ramda';

const emitter = mitt();
export const evt = 'rerender';

export const onRerender: (cb: () => void) => void = curry(emitter.on)(
  evt as any,
);
export const rerender = () => emitter.emit(evt);

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

export function reset(omitKeys: string[] = []) {
  Object.assign(mutables, omit(omitKeys, getInitialValue()));
}

if (process.env.NODE_ENV !== 'production') {
  window['$$my_react-mutables'] = mutables;
}
