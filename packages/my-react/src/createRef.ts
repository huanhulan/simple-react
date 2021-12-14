export function createRef<T>(): RefObject<T> {
  return { current: null };
}
