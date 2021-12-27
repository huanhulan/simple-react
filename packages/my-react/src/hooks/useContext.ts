import { Context, ContextHook, Fiber } from '../../typings';

import { HOOK_TAG } from './hookTags';
import { getHookState } from './getHookState';
import { mutables } from '../mutables';

export function useContext<T>(context: Context<T>) {
  const tag = HOOK_TAG.useContext;
  const oldHook = getHookState() as ContextHook<T>;
  if (oldHook && oldHook.tag !== tag) {
    // eslint-disable-next-line quotes
    throw new Error("Hook tag doesn't match with the previous fiber");
  }
  const hook: ContextHook<T> = {
    context,
    tag,
  };
  const provider = mutables?.wipFiber?.context?.[context.id];
  mutables.wipFiber?.hooks?.push(hook);
  if (!provider) {
    return context.defaultValue;
  }
  return (provider as Fiber<{ value: T }>).props.value;
}
