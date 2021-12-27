import { isNil } from 'ramda';
import { FunctionComponent, Ref } from '../typings';

export function forwardRef<P = Record<string, any>>(fn: FunctionComponent<P>) {
  function Forwarded(
    props: P,
    // eslint-disable-next-line
     ref: Ref<any> = props?.['ref']
  ) {
    const clone = { ...props };
    // eslint-disable-next-line
    delete clone['ref'];
    // react sets default to null
    return fn(clone, isNil(ref) ? null : ref);
  }

  return Forwarded;
}
