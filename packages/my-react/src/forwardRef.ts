export function forwardRef<P = Record<string, any>>(fn: FunctionComponent<P>) {
  function Forwarded(
    props: P,
    // eslint-disable-next-line
     ref: Ref<any> = props?.['ref']
  ) {
    const clone = { ...props };
    // eslint-disable-next-line
    delete clone['ref'];
    return fn(
      clone,
      !ref || (typeof ref === 'object' && ref === null) ? undefined : ref,
    );
  }

  return Forwarded;
}
