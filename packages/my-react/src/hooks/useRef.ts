import { useMemo } from './useMemo';
import { HOOK_TAG } from './hookTags';
import { createRef } from '../createRef';

export function useRef<T>(initialValue: T | null | undefined) {
  const ref = createRef<T>();
  ref.current = initialValue as any;
  return useMemo(() => ref, [], HOOK_TAG.useRef);
}
