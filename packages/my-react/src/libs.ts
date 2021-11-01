export function getChildFibers(fiber?: Fiber) {
  const children = [];

  let tmp = fiber?.child;
  while (tmp) {
    children.push(tmp);
    tmp = tmp.sibling;
  }
  return children;
}

export function swap<T>(list: Array<T>, l: number, r: number) {
  const k = list[l];
  list[l] = list[r];
  list[r] = k;
}
