import { is } from 'ramda';
import { Fiber } from '../typings';

export function isFunctionComponent({ type }: Fiber) {
  return is(Function, type);
}
