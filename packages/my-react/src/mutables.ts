export const mutables = {
  nextUnitOfWork: undefined,
  wipRoot: undefined,
  deletions: [],
  currentRoot: undefined,
} as {
  nextUnitOfWork?: Fiber;
  wipRoot?: Fiber;
  currentRoot?: Fiber;
  deletions: Fiber[];
};
