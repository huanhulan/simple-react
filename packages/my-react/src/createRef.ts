import { RefObject } from '../typings';

export function createRef<T>(): RefObject<T> {
  return { current: null };
}
