export const mutables = {
  nextUnitOfWork: undefined,
  hookIndex: undefined,
  // work in progress root or wipRoot, keep track of the root of the fiber tree
  wipRoot: undefined,
  wipFiber: undefined,
  // save a reference to that “last fiber tree we committed to the DOM” after we finish a commit.
  currentRoot: undefined,
  // keep track of the nodes we want to remove
  deletions: [],
} as {
  nextUnitOfWork?: Fiber;
  hookIndex?: number;
  wipRoot?: Fiber;
  wipFiber?: Fiber;
  currentRoot?: Fiber;
  deletions: Fiber[];
};
