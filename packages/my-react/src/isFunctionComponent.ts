import { is } from 'ramda';

export function isFunctionComponent({ type }: Fiber) {
  return is(Function, type);
}
