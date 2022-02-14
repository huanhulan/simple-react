import { Fiber, EffectHook } from '../../typings';
import { EFFECT_TAG } from '../constants';
import { mutables } from '../mutables';
import { HOOK_TAG } from './hookTags';
import { getHookState } from './getHookState';
import { hasDepsChanged } from './hasDepsChanged';

function effectsFactory(hookTag: HOOK_TAG) {
  function cancelEffects(fiber: Fiber) {
    fiber?.hooks
      ?.filter((hook) => hook.tag === hookTag && (hook as EffectHook).cancel)
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
  function runEffects(fiber: Fiber) {
    fiber?.hooks
      ?.filter((hook) => hook.tag === hookTag && (hook as EffectHook).effect)
      .forEach((effectHook) => {
        (effectHook as EffectHook).cancel = (
          (effectHook as EffectHook).effect as () => any
        )();
      });
  }

  function useEffect(effect: () => any, deps?: any[]) {
    const oldHook = getHookState();

    if (oldHook && oldHook.tag !== hookTag) {
      // eslint-disable-next-line quotes
      throw new Error("Hook tag doesn't match with the previous fiber");
    }
    const hasChanged = hasDepsChanged(
      oldHook ? (oldHook as EffectHook).deps : undefined,
      deps,
    );
    function getHookTemplate() {
      return {
        tag: hookTag,
        effect: hasChanged ? effect : undefined,
        hasChanged,
        deps,
      };
    }
    const hook: EffectHook = oldHook
      ? Object.assign(oldHook, getHookTemplate())
      : getHookTemplate();

    if (process.env.NODE_ENV !== 'production') {
      (hook as Record<string, any>).fiber = mutables?.wipFiber;
    }

    mutables?.wipFiber?.hooks?.push(hook);
  }

  return {
    cancelEffects,
    runEffects,
    useEffect,
  };
}

export const { cancelEffects, runEffects, useEffect } = effectsFactory(
  HOOK_TAG.useEffect,
);
export const {
  cancelEffects: cancelLayoutEffects,
  runEffects: runLayoutEffects,
  useEffect: useLayoutEffect,
} = effectsFactory(HOOK_TAG.useLayoutEffect);
