import { mutables } from './mutables';
import { EFFECT_TAG } from './constants';

export function getChildFibers(fiber?: Fiber) {
  const children = [];

  let tmp = fiber?.child;
  while (tmp) {
    children.push(tmp);
    tmp = tmp.sibling;
  }
  return children;
}

export function swap<T>(list: Array<T>, l: number, r: number) {
  const k = list[l];
  list[l] = list[r];
  list[r] = k;
}

export function enqueueMove(fiber: Fiber, nodes: Node[]) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  if (mutables.moves.find(([fib, _]) => fib === fiber)) {
    return;
  }
  mutables.moves.push([fiber, nodes]);
}

export function enqueueDelete(fiber: Fiber) {
  if (mutables.deletions.includes(fiber)) {
    return;
  }
  fiber.effectTag = EFFECT_TAG.DELETION;
  mutables.deletions.push(fiber);
}
