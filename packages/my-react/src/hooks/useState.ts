import { is } from 'ramda';
import { StateHook, Fiber } from '../../typings';

import { mutables, pendingFibers } from '../mutables';
import { getHookState } from './getHookState';
import { HOOK_TAG } from './hookTags';

function findDispatchParent(fiber: Fiber): Fiber {
  let node = fiber.parent;
  while (node) {
    if (typeof node.type === 'string') {
      return node;
    }
    node = node.parent;
  }
  return mutables.currentRoot as Fiber;
}

/**
 * When MyReact receives a new update during the render phase,
 * it throws away the work in progress tree and starts again from the root.
 * React tags each update with an expiration timestamp and uses it to decide which update has a higher priority.
 */
export function useState<P>(
  initialState: P,
): [P, (action: P | ((p: P) => P)) => void] {
  const tag = HOOK_TAG.useState;
  const oldHook = getHookState() as StateHook<P>;

  if (oldHook && oldHook.tag !== tag) {
    // eslint-disable-next-line quotes
    throw new Error("Hook tag doesn't match with the previous fiber");
  }

  const hook: StateHook<P> = {
    state: oldHook?.state || initialState,
    queue: [],
    tag,
  };
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = is(Function, action)
      ? (action as (p: P) => P)(hook.state)
      : (action as P);
  });
  const hookOwner = mutables.wipFiber;
  const setState = (action: ((p: P) => P) | P) => {
    hook.queue.push(action);
    if (hookOwner) {
      hookOwner.dirty = true;
    }
    if (mutables.currentRoot) {
      mutables.wipRoot = mutables.currentRoot;
      const fiberToDispatch = findDispatchParent(hookOwner as Fiber);
      fiberToDispatch.alternate = fiberToDispatch;
      pendingFibers.enqueue(fiberToDispatch);
    } else {
      (mutables.wipRoot as Fiber).alternate = mutables.wipRoot;
      pendingFibers.enqueue(mutables.wipRoot as Fiber);
    }
  };
  mutables.wipFiber?.hooks?.push(hook);

  return [hook.state, setState];
}
