/** @jsx createElement */
import { createElement, useRef, useEffect } from 'my-react';

export function Input({
  autoFocus,
  ...props
}: Record<string, any> & {
  autoFocus: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) {
      inputRef?.current?.focus();
    }
  }, []);
  return <input ref={inputRef} {...props} type="input" />;
}
