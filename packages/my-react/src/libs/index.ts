import { equals } from 'ramda';

export { Heap } from './heap';

export function swap<T>(list: Array<T>, l: number, r: number) {
  const k = list[l];
  list[l] = list[r];
  list[r] = k;
}

export function shallowEqObj(a: Record<string, any>, b: Record<string, any>) {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (!equals(keysA, keysB)) {
    return false;
  }
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}
