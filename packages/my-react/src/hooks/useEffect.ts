import { mutables } from '../mutables';

const effectHookTag = 'effect';

export function cancelEffects(fiber: Fiber) {
  fiber?.hooks
    ?.filter((hook) => hook.tag === effectHookTag && hook.cancel)
    .forEach((effectHook: UseEffectHook) => {
      // https://github.com/microsoft/TypeScript/issues/40201#issuecomment-678805128
      // @ts-ignore
      effectHook?.cancel();
    });
}

export function runEffects(fiber: Fiber) {
  fiber?.hooks
    ?.filter((hook) => hook.tag === effectHookTag && hook.effect)
    .forEach((effectHook) => {
      effectHook.cancel = effectHook.effect();
    });
}

const hasDepsChanged = (prevDeps: any[], nextDeps: any[]) =>
  !prevDeps ||
  !nextDeps ||
  prevDeps.length !== nextDeps.length ||
  prevDeps.some((dep) => !nextDeps.includes(dep));

export function useEffect(effect: () => any, deps: any[]) {
  const oldHook = mutables?.wipFiber?.alternate?.hooks?.[mutables.hookIndex];

  const hasChanged = hasDepsChanged(oldHook ? oldHook.deps : undefined, deps);

  const hook = {
    tag: effectHookTag,
    effect: hasChanged ? effect : null,
    cancel: hasChanged && oldHook && oldHook.cancel,
    deps,
  };

  mutables?.wipFiber?.hooks?.push(hook);
  mutables.hookIndex += 1;
}
