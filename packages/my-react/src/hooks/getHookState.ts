import { mutables } from '../mutables';
import { IHook } from '../../typings/types';

export function getHookState(): IHook | undefined {
  const hookIndex = mutables?.wipFiber?.hooks?.length || 0;
  const oldHooks = (mutables.wipFiber as Fiber)?.alternate?.hooks;
  return oldHooks?.[hookIndex];
}
