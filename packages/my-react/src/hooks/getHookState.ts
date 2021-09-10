import { mutables } from '../mutables';

export function getHookState(): Hook {
  const hookIndex = mutables?.wipFiber?.hooks?.length || 0;
  const oldHooks = (mutables.wipFiber as Fiber)?.alternate?.hooks;
  return oldHooks && oldHooks[hookIndex];
}
