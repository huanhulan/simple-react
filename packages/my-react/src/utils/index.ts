import { Fiber } from '../../typings';
import { mutables } from '../mutables';
import { EFFECT_TAG } from '../constants';

export function getChildFibers(fiber?: Fiber) {
  const children = [];

  let tmp = fiber?.child;
  while (tmp) {
    children.push(tmp);
    tmp = tmp.sibling;
  }
  return children;
}

export function enqueueMove(fiber: Fiber, nodes: Node[]) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  if (mutables.moves.find(([fib, _]) => fib === fiber)) {
    return;
  }
  mutables.moves.push([fiber, nodes]);
}

export function enqueueDelete(fiber: Fiber) {
  fiber.effectTag = EFFECT_TAG.DELETION;
  mutables.fibersToDelete.add(fiber);
}

export function downToFindFibersWithDom(fiber: Fiber): Fiber[] {
  const children = getChildFibers(fiber);
  return children
    .map((fib) => {
      if (fib?.dom && !fib.isPortal) {
        return [fib];
      }
      return downToFindFibersWithDom(fib);
    })
    .flat();
}

export function findParentFiberWithDom(fiber?: Fiber): Fiber {
  if (!fiber?.dom) {
    return findParentFiberWithDom(fiber?.parent);
  }
  return fiber;
}
