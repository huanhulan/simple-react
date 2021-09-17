import { EFFECT_TAG } from '../constants';
import { mutables } from '../mutables';
import { HOOK_TAG } from './hookTags';
import { getHookState } from './getHookState';
import { hasDepsChanged } from './hasDepsChanged';

export function cancelEffects(fiber: Fiber) {
  fiber?.hooks
    ?.filter((hook) => hook.tag === HOOK_TAG.useEffect && hook.cancel)
    .forEach((effectHook: UseEffectHook) => {
      if (effectHook.hasChanged || fiber.effectTag === EFFECT_TAG.DELETION)
        // https://github.com/microsoft/TypeScript/issues/40201#issuecomment-678805128
        // @ts-ignore
        effectHook?.cancel();
    });
}

export function runEffects(fiber: Fiber) {
  fiber?.hooks
    ?.filter((hook) => hook.tag === HOOK_TAG.useEffect && hook.effect)
    .forEach((effectHook) => {
      effectHook.cancel = effectHook.effect();
    });
}

export function useEffect(effect: () => any, deps: any[]) {
  const tag = HOOK_TAG.useEffect;
  const oldHook = getHookState() as EffectHook;

  if (oldHook && oldHook.tag !== tag) {
    // eslint-disable-next-line quotes
    throw new Error("Hook tag doesn't match with the previous fiber");
  }
  const hasChanged = hasDepsChanged(oldHook ? oldHook.deps : undefined, deps);

  const hook: EffectHook = {
    tag,
    effect: hasChanged ? effect : null,
    cancel: oldHook?.cancel,
    hasChanged,
    deps,
  };

  mutables?.wipFiber?.hooks?.push(hook);
}
