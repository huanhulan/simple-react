import { equals, isNil } from 'ramda';

import { createDom } from './commit';
import { EFFECT_TAG } from './constants';
import { isFunctionComponent } from './isFunctionComponent';
import { enqueueDelete, getChildFibers, swap } from './libs';
import { mutables } from './mutables';
import { createTextElement } from './createElement';

function shallowEqObj(a: Record<string, any>, b: Record<string, any>) {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (!equals(keysA, keysB)) {
    return false;
  }
  return keysA.reduce((curr, key) => curr && a[key] === b[key], true);
}

function walkFiberTree(fiber?: Fiber): Fiber | undefined {
  if (!fiber) {
    return fiber;
  }
  if (fiber.sibling) {
    return fiber.sibling;
  }
  return walkFiberTree(fiber.parent);
}

/**
 * Diff given fibers and return a indicator for whether to reuse the old fiber
 * @param oldFiber
 * @param newFiber
 * @returns `true` for not reusing, `false` for reusing
 */
function diffFiber(oldFiber: Fiber, newFiber: Fiber): boolean {
  if (newFiber.type !== oldFiber.type) {
    enqueueDelete(oldFiber);
    newFiber.effectTag = EFFECT_TAG.PLACEMENT;
    return true;
  }
  const propChanged = !shallowEqObj(newFiber.props, oldFiber.props);
  newFiber.dom = oldFiber?.dom;
  newFiber.alternate = oldFiber;
  if (propChanged || oldFiber?.dirty) {
    newFiber.effectTag = EFFECT_TAG.UPDATE;
    delete oldFiber?.alternate;
    return true;
  }
  oldFiber.effectTag = undefined;
  oldFiber.alternate = oldFiber;
  return false;
}

// BFS children diff
function reconcileChildren(
  wipFiber: Fiber,
  elements: Fiber['props']['children'],
) {
  const os = getChildFibers(wipFiber?.alternate as Fiber);
  const ns: Partial<Fiber>[] = elements
    .filter((fib) => !!fib)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .map((element: unknown) => ({
      type: (element as MyReactElement).type,
      props: (element as MyReactElement).props,
      parent: wipFiber,
      ...((element as MyReactElement).ref && {
        ref: (element as MyReactElement).ref,
      }),
      ...((element as MyReactElement).props.key && {
        key: (element as MyReactElement).props.key,
      }),
      ...(wipFiber.context && {
        context: {
          ...wipFiber.context,
        },
      }),
    }));

  // head pointers
  let oldFirstIndex = 0;
  let newFirstIndex = 0;
  // tail pointers
  let oldLastIndex = os.length - 1;
  let newLastIndex = ns.length - 1;

  // head and tail fibers for each list
  const fiberMap = {
    get newFirst() {
      return ns[newFirstIndex];
    },
    get newLast() {
      return ns[newLastIndex];
    },
    get oldFirst() {
      return os[oldFirstIndex];
    },
    get oldLast() {
      return os[oldLastIndex];
    },
  };

  // swap index
  let tmp;

  let found: boolean;

  for (;;) {
    /**
     * check base case, first > last for both new and old
     * [ ] -- old children empty (fully-swapped)
     * [ ] -- new children empty (fully-swapped)
     */
    if (newFirstIndex > newLastIndex && oldFirstIndex > oldLastIndex) {
      break;
    }

    /* Initialize */

    const { newFirst, newLast, oldFirst, oldLast } = fiberMap;

    if (oldFirstIndex > oldLastIndex) {
      /**
       * No more old nodes, create and insert all remaining nodes
       * -> [ ] <- old children
       * -> [ a b c ] <- new children
       */
      newFirst.effectTag = EFFECT_TAG.PLACEMENT;
      os.splice(newFirstIndex, 0, newFirst as Fiber);
      newFirstIndex += 1;
    } else if (newFirstIndex > newLastIndex) {
      /**
       * No more new nodes, delete all remaining nodes in old list
       * -> [ a b c ] <- old children
       * -> [ ] <- new children
       */
      tmp = oldLastIndex;
      while (oldLastIndex >= oldFirstIndex) {
        enqueueDelete(os[oldLastIndex]);
        oldLastIndex -= 1;
      }
      os.splice(oldFirstIndex, tmp - oldFirstIndex + 1);
      break;
    } else if (
      !isNil(oldFirst.key) &&
      !isNil(newFirst.key) &&
      oldFirst.key === newFirst.key
    ) {
      /**
       * happy path, everything aligns, we continue
       * -> oldFirstIndex -> [ a b c ] <- oldLastIndex
       * -> newFirstIndex -> [ a b c ] <- newLastIndex
       * check if nFirst and oFirst align, if not, check nLast and oLast
       */
      if (!diffFiber(os[oldFirstIndex], ns[newFirstIndex] as Fiber)) {
        /**
         * reuse fiber if no effect should happen,
         * update it's sibling pointer and parent pointer latter
         */
        ns[newFirstIndex] = os[oldFirstIndex];
      }
      oldFirstIndex += 1;
      newFirstIndex += 1;
    } else if (
      !isNil(oldLast.key) &&
      !isNil(newLast.key) &&
      oldLast.key === newLast.key
    ) {
      if (!diffFiber(os[oldLastIndex], ns[newLastIndex] as Fiber)) {
        ns[newLastIndex] = os[oldLastIndex];
      }
      oldLastIndex -= 1;
      newLastIndex -= 1;
    } else if (
      !isNil(oldFirst.key) &&
      !isNil(newFirst.key) &&
      !isNil(newLast.key) &&
      !isNil(oldLast.key) &&
      oldFirst.key === newLast.key &&
      newFirst.key === oldLast.key
    ) {
      /**
       * flip-flop case, nodes have been swapped, in some way or another
       * both could be swapped.
       * -> [ a b c ] <- old children
       * -> [ c b a ] <- new children
       */
      swap(os, oldFirstIndex, oldLastIndex);

      if (!diffFiber(os[oldFirstIndex], ns[newFirstIndex] as Fiber)) {
        ns[newFirstIndex] = os[oldFirstIndex];
      }
      if (!diffFiber(os[oldLastIndex], ns[newLastIndex] as Fiber)) {
        ns[newLastIndex] = os[oldLastIndex];
      }

      oldFirstIndex += 1;
      newFirstIndex += 1;
      oldLastIndex -= 1;
      newLastIndex -= 1;
    } else if (
      !isNil(oldFirst.key) &&
      !isNil(newLast.key) &&
      oldFirst.key === newLast.key
    ) {
      /**
       * Or just one could be swapped ('d' is align here)
       *  This is top left and bottom right match case.
       *  We move 'd' to end of list, mutate old fibers to reflect the change
       *  We then continue without affecting indexes, hoping to land in a better case
       *  -> [ d a b ] <- old children
       *  -> [ a b d ] <- new children
       *  becomes
       *  -> [ a b d ] <- old children
       *  -> [ a b d ] <- new children
       *  and now we happy path
       */
      // move the head to the end of the list
      os.splice(oldLastIndex, 0, os.splice(oldFirstIndex, 1)[0]);
      if (!diffFiber(os[oldLastIndex], ns[newLastIndex] as Fiber)) {
        ns[newLastIndex] = os[oldLastIndex];
      }
      oldLastIndex -= 1;
      newLastIndex -= 1;
    } else if (
      !isNil(newFirst.key) &&
      !isNil(oldLast.key) &&
      newFirst.key === oldLast.key
    ) {
      /**
       * This is top right and bottom lefts match case.
       *  We move d to head of list
       *  -> [ b a d ] <- old children
       *  -> [ d b a ] <- new children
       *  becomes
       *  -> [ d b a ] <- old children
       *  -> [ d b a ] <- new children
       *  and now we happy path
       */
      os.splice(oldFirstIndex, 0, os.splice(oldLastIndex, 1)[0]);

      if (!diffFiber(os[oldFirstIndex], newFirst as Fiber)) {
        ns[newFirstIndex] = os[oldFirstIndex];
      }

      oldFirstIndex += 1;
      newFirstIndex += 1;
    } else {
      /**
       * The 'you're screwed' case, nothing aligns, pull the ripcord, do something more fancy
       * This can happen when the list is sorted, for example.
       * -> [ a e c ] <- old children
       * -> [ b e d ] <- new children
       */

      /**
       * final case, perform linear search to check if new key exists in old map,
       * decide what to do from there
       */
      found = false;
      tmp = oldFirstIndex;
      if (!isNil(newFirst.key)) {
        while (tmp <= oldLastIndex) {
          if (os[tmp].key === newFirst.key) {
            found = true;
            break;
          }
          tmp += 1;
        }
      } else {
        tmp = oldFirstIndex;

        while (tmp <= oldLastIndex) {
          if (os[tmp].type === newFirst.type && os[tmp].key === undefined) {
            found = true;
            break;
          }
          tmp += 1;
        }
      }

      if (found) {
        /**
         * If new key was found in old map this means it was moved, hypothetically as below
         * -> [ a e b c ] <- old children
         * -> [ b e a j ] <- new children
         *      ^
         * In the above case 'b' has been moved, so we need to insert 'b' before 'a'
         * We also increase oldFirstIndex and newFirstIndex.
         * This results in new list below
         * updated index position
         * -> [ b a e c ] <- old children
         * -> [ b e a j ] <- new children
         *      ^
         */

        // Move item to correct position
        os.splice(oldFirstIndex, 0, os.splice(tmp, 1)[0]);

        if (!diffFiber(os[oldFirstIndex], ns[newFirstIndex] as Fiber)) {
          ns[newFirstIndex] = os[oldFirstIndex];
        }

        oldFirstIndex += 1;
        newFirstIndex += 1;
      } else {
        /**
         * If new key was *not* found in the old map this means it must now be created, example below
         * -> [ a e d c ] <- old children
         * -> [ b e a j ] <- new children
         *      ^
         * In the above case 'b' does not exist in the old map, so we create a new fiber.
         * We then insertBefore in both fiber.
         * -> [ b a e d c ] <- old children
         * -> [ b e a j   ] <- new children
         *      ^
         */
        newFirst.effectTag = EFFECT_TAG.PLACEMENT;
        os.splice(oldFirstIndex, 0, newFirst as Fiber);
        newFirstIndex += 1;
        oldFirstIndex += 1;
        oldLastIndex += 1;
      }
    }
  }

  // construct the traverse path of the new fiber tree
  (ns as Fiber[]).forEach((el, idx) => {
    if (idx === 0) {
      wipFiber.child = el;
    }
    el.sibling = ns[idx + 1] as Fiber | undefined;
    el.parent = wipFiber;
  });
}

// only run the constructor when there is a effect tag
function updateFunctionComponent(fiber: Fiber) {
  mutables.wipFiber = fiber;

  let res: ComponentChild[] | ComponentChild;
  if (isNil(fiber.effectTag)) {
    res = fiber.props.children;
  } else {
    fiber.hooks = [];
    res = (fiber.type as FunctionComponent)(fiber.props);
    if (
      res &&
      (typeof res === 'number' ||
        typeof res === 'string' ||
        typeof res === 'boolean')
    ) {
      res = createTextElement(res);
    }
  }

  if (!res) {
    return;
  }

  const children = Array.isArray(res) ? res : [res];
  // remember the normalized result in case of fiber reusing
  if (!isNil(fiber.effectTag)) {
    fiber.props.children = children;
  }

  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber: Fiber) {
  // the fiber from a function component doesn't have a DOM node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

// DFS fiber tree construction
export function performUnitOfWork(fiber: Fiber) {
  const isFC = isFunctionComponent(fiber);
  if (isFC) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // go deeper
  if (fiber.child) {
    return fiber.child;
  }
  // goto next sibling or parent
  return walkFiberTree(fiber);
}
