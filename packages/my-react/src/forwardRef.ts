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
      !ref || (typeof ref === 'object' && !('current' in ref))
        ? undefined
        : ref,
    );
  }

  return Forwarded;
}
