import { useRef } from './useRef';
import { useEffect } from './useEffect';
import { useCallback } from './useCallback';

export function useEventCallback<Args extends unknown[], Return>(
  cb: (...args: Args) => Return,
) {
  const ref = useRef(cb);
  useEffect(() => {
    ref.current = cb;
  }, [cb]);
  return useCallback(
    (...args: Args) => (ref.current as typeof cb)(...args),
    [],
  );
}
