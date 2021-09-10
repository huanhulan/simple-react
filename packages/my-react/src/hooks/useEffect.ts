import { EFFECT_TAG } from '../constants';
import { mutables } from '../mutables';
import { EFFECT_HOOK_TAG } from './hookTags';
import { getHookState } from './getHookState';
import { hasDepsChanged } from './hasDepsChanged';

export function cancelEffects(fiber: Fiber) {
  fiber?.hooks
    ?.filter((hook) => hook.tag === EFFECT_HOOK_TAG.useEffect && hook.cancel)
    .forEach((effectHook: UseEffectHook) => {
      if (effectHook.hasChanged || fiber.effectTag === EFFECT_TAG.DELETION)
        // https://github.com/microsoft/TypeScript/issues/40201#issuecomment-678805128
        // @ts-ignore
        effectHook?.cancel();
    });
}

export function runEffects(fiber: Fiber) {
  fiber?.hooks
    ?.filter((hook) => hook.tag === EFFECT_HOOK_TAG.useEffect && hook.effect)
    .forEach((effectHook) => {
      effectHook.cancel = effectHook.effect();
    });
}

export function useEffect(effect: () => any, deps: any[]) {
  const oldHook = getHookState() as EffectHook;

  const hasChanged = hasDepsChanged(oldHook ? oldHook.deps : undefined, deps);

  const hook: EffectHook = {
    tag: EFFECT_HOOK_TAG.useEffect,
    effect: hasChanged ? effect : null,
    cancel: oldHook?.cancel,
    hasChanged,
    deps,
  };

  mutables?.wipFiber?.hooks?.push(hook);
}
