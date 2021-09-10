export const hasDepsChanged = (prevDeps?: any[], nextDeps?: any[]) =>
  !prevDeps ||
  !nextDeps ||
  prevDeps.length !== nextDeps.length ||
  prevDeps.some((dep) => !nextDeps.includes(dep));
