import { mutables } from '../mutables';
import { getHookState } from './getHookState';
import { hasDepsChanged } from './hasDepsChanged';
import { EFFECT_HOOK_TAG } from './hookTags';

function getMemoHook<P>(factory: () => P, deps: any[]) {
  const oldHook = getHookState() as MemoHook<P>;

  if (!oldHook || hasDepsChanged(oldHook.deps, deps)) {
    return {
      tag: EFFECT_HOOK_TAG.useMemo,
      value: factory(),
      deps,
      factory,
    };
  }
  return oldHook;
}

export function useMemo<P>(factory: () => P, deps: any[]) {
  const hook = getMemoHook(factory, deps);
  mutables?.wipFiber?.hooks?.push(hook);
  return hook.value;
}
