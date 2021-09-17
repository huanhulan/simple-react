import { useMemo } from './useMemo';
import { HOOK_TAG } from './hookTags';

export function useCallback(callback: (...params: any[]) => any, deps: any[]) {
  return useMemo(() => callback, deps, HOOK_TAG.useCallback);
}
