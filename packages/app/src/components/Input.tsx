/** @jsx createElement */
import { createElement, useRef, useEffect, memo } from 'my-react';

export const Input = memo(function Input<T extends string = 'input'>({
  autoFocus,
  ...props
}: {
  type: T;
} & (T extends 'input'
  ? {
      autoFocus: boolean;
    } & Record<string, any>
  : Record<string, any>)) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) {
      inputRef?.current?.focus();
    }
  }, []);
  return <input ref={inputRef} {...props} />;
});
