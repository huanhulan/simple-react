import { Ref } from '../../typings';
import { useEffect } from './useEffect';

export function useImperativeHandle<T = Record<string, any>>(
  ref: Ref<T>,
  createHandle: () => T,
  deps?: any[],
) {
  useEffect(
    () => {
      if (typeof ref === 'function') {
        ref(createHandle());
        return;
      }
      if (ref) {
        ref.current = createHandle();
      }
    },
    Array.isArray(deps) ? [...deps, ref] : deps,
  );
}
