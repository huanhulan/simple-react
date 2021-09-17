import { useMemo } from './useMemo';
import { HOOK_TAG } from './hookTags';

export function useRef<T>(initialValue: T) {
  return useMemo(() => ({ current: initialValue }), [], HOOK_TAG.useRef);
}
