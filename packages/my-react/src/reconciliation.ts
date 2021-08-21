import { isNil } from 'ramda';
import { isFunctionComponent } from './isFunctionComponent';
import { createDom } from './commit';
import { EFFECT_TAG } from './constants';
import { mutables } from './mutables';

function walkFiberTree(fiber?: Fiber): Fiber | undefined {
  if (!fiber) {
    return fiber;
  }
  if (fiber.sibling) {
    return fiber.sibling;
  }
  return walkFiberTree(fiber.parent);
}

function reconcileChildren(
  wipFiber: Fiber,
  elements: Fiber['props']['children']
) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling: Fiber = {} as any;

  while (
    index < elements.length ||
    oldFiber != null // if the linked list of old fiber is longer than the current element list
  ) {
    const element = elements[index];
    let newFiber = {
      type: element.type,
      props: element.props,
      parent: wipFiber,
    } as Fiber;

    const sameType =
      !isNil(oldFiber) && !isNil(element) && element.type === oldFiber.type;

    /**
     * if the old fiber and the new element have the same type,
     * we can keep the DOM node and just update it with the new props
     */
    if (sameType) {
      newFiber = {
        ...newFiber,
        dom: oldFiber?.dom,
        alternate: oldFiber,
        effectTag: EFFECT_TAG.UPDATE,
      };
    }

    /**
     * if the type is different and there is a new element, it means we need to create a new DOM node
     */
    if (!isNil(element) && !sameType) {
      newFiber = {
        ...newFiber,
        dom: undefined,
        alternate: undefined,
        effectTag: EFFECT_TAG.PLACEMENT,
      };
    }

    /**
     *  if the types are different and there is an old fiber, we need to remove the old node
     */
    if (!isNil(oldFiber) && !sameType) {
      oldFiber.effectTag = EFFECT_TAG.DELETION;
      mutables.deletions.push(oldFiber);
    }

    // forward a step
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;

    index += 1;
  }
}

function updateFunctionComponent(fiber: Fiber) {
  mutables.wipFiber = fiber;
  mutables.hookIndex = 0;
  fiber.hooks = [];
  const res = (fiber.type as FunctionComponent)(fiber.props);
  if (!res) {
    return;
  }
  const children = Array.isArray(res) ? res : [res];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber: Fiber) {
  // the fiber from a function component doesn't have a DOM node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

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
