import { isNil, is } from 'ramda';
import { mutables } from '../mutables';

/**
 * When MyReact receives a new update during the render phase,
 * it throws away the work in progress tree and starts again from the root.
 * React tags each update with an expiration timestamp and uses it to decide which update has a higher priority.
 */
export function useState<P>(
  initialState: P
): [P, (action: P | ((p: P) => P)) => void] {
  const oldHooks = mutables.wipFiber?.alternate?.hooks;
  const oldHook: StateHook<P> = oldHooks && oldHooks[mutables.hookIndex || 0];
  const hook: StateHook<P> = {
    state: oldHook?.state || initialState,
    queue: [],
  };
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = is(Function, action)
      ? (action as (p: P) => P)(hook.state)
      : (action as P);
  });
  const setState = (action: ((p: P) => P) | P) => {
    hook.queue.push(action);
    mutables.wipRoot = {
      dom: mutables.currentRoot?.dom,
      props: mutables.currentRoot?.props as any,
      alternate: mutables.currentRoot,
    };
    mutables.nextUnitOfWork = mutables.wipRoot;
    mutables.deletions = [];
  };
  mutables.wipFiber?.hooks?.push(hook);
  if (!isNil(mutables.hookIndex)) {
    mutables.hookIndex += 1;
  }

  return [hook.state, setState];
}