import { Fiber, IHook } from '../../typings';
import { mutables } from '../mutables';

export function getHookState(): IHook | undefined {
  const hookIndex = mutables?.wipFiber?.hooks?.length || 0;
  const oldHooks = (mutables.wipFiber as Fiber)?.alternate?.hooks;
  return oldHooks?.[hookIndex];
}
