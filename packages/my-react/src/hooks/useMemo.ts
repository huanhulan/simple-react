import { MemoHook } from '../../typings';
import { mutables } from '../mutables';
import { getHookState } from './getHookState';
import { hasDepsChanged } from './hasDepsChanged';
import { HOOK_TAG } from './hookTags';

function getMemoHook<P>(factory: () => P, deps: any[], tag: HOOK_TAG) {
  const oldHook = getHookState() as MemoHook<P>;
  if (oldHook && oldHook.tag !== tag) {
    // eslint-disable-next-line quotes
    throw new Error("Hook tag doesn't match with the previous fiber");
  }
  if (!oldHook || hasDepsChanged(oldHook.deps, deps)) {
    return {
      tag,
      value: factory(),
      deps,
      factory,
    };
  }
  return oldHook as {
    tag: HOOK_TAG;
    value: P;
    deps: any[];
    factory: () => P;
  };
}

export function useMemo<P>(
  factory: () => P,
  deps: any[],
  tag = HOOK_TAG.useMemo,
) {
  const hook = getMemoHook(factory, deps, tag);
  mutables?.wipFiber?.hooks?.push(hook);
  return hook.value;
}
