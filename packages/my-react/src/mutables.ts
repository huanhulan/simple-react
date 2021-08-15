export const mutables = {
  nextUnitOfWork: undefined,
  // work in progress root or wipRoot, keep track of the root of the fiber tree
  wipRoot: undefined,
  deletions: [],
  currentRoot: undefined,
} as {
  dom?: HTMLElement;
  nextUnitOfWork?: Fiber;
  wipRoot?: Fiber;
  currentRoot?: Fiber;
  deletions: Fiber[];
};
