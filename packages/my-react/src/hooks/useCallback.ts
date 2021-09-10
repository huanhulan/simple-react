import { useMemo } from './useMemo';

export function useCallback(callback: (...params: any[]) => any, deps: any[]) {
  return useMemo(() => callback, deps);
}
