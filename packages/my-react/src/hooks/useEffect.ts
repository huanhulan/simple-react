import { EFFECT_TAG } from '../constants';
import { mutables } from '../mutables';
import { HOOK_TAG } from './hookTags';
import { getHookState } from './getHookState';
import { hasDepsChanged } from './hasDepsChanged';

export function cancelEffects(fiber: Fiber) {
  fiber?.hooks
    ?.filter(
      (hook) => hook.tag === HOOK_TAG.useEffect && (hook as EffectHook).cancel
    )
    .forEach((effectHook) => {
      if (
        ((effectHook as EffectHook).hasChanged ||
          fiber.effectTag === EFFECT_TAG.DELETION) &&
        typeof (effectHook as EffectHook)?.cancel === 'function'
      ) {
        ((effectHook as EffectHook).cancel as () => any)();
      }
    });
}

export function runEffects(fiber: Fiber) {
  fiber?.hooks
    ?.filter(
      (hook) => hook.tag === HOOK_TAG.useEffect && (hook as EffectHook).effect
    )
    .forEach((effectHook) => {
      (effectHook as EffectHook).cancel = (
        (effectHook as EffectHook).effect as () => any
      )();
    });
}

export function useEffect(effect: () => any, deps: any[]) {
  const tag = HOOK_TAG.useEffect;
  const oldHook = getHookState();

  if (oldHook && oldHook.tag !== tag) {
    // eslint-disable-next-line quotes
    throw new Error("Hook tag doesn't match with the previous fiber");
  }
  const hasChanged = hasDepsChanged(
    oldHook ? (oldHook as EffectHook).deps : undefined,
    deps
  );

  const hook: EffectHook = {
    tag,
    effect: hasChanged ? effect : undefined,
    cancel: (oldHook as EffectHook)?.cancel,
    hasChanged,
    deps,
  };

  mutables?.wipFiber?.hooks?.push(hook);
}
