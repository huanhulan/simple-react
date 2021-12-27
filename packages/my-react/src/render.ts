import { isNil } from 'ramda';
import { MyReactElement, Fiber } from '../typings';
import { mutables, reset, pendingFibers } from './mutables';
import { workLoop } from './concurrency';

function mount(reactElm: MyReactElement, node: HTMLElement) {
  if (isNil(reactElm)) {
    return;
  }
  mutables.wipRoot = {
    dom: node,
    props: {
      children: [reactElm],
    },
    alternate: mutables.currentRoot,
  };
  pendingFibers.enqueue(mutables.wipRoot, true);
}

/**
 * React using hydration alghorism on render and remember the fiber on host dom element so it can just use render(null, node) to unmount a tree
 * Here we have to do it in a nasty way for the sake of simplicity
 */
export function unmountComponentAtNode(node: HTMLElement) {
  if (mutables.currentRoot?.dom !== node) {
    return false;
  }
  // eslint-disable-next-line
  const fiberDOMs = []
  function walk(fiber: Fiber) {
    if (fiberDOMs.length) {
      return;
    }
    if (fiber.dom?.parentElement === node) {
      fiberDOMs.push(fiber);
    }
    if (fiber.sibling) {
      walk(fiber.sibling);
    }
    if (fiber.child) {
      walk(fiber.child);
    }
  }
  walk(mutables.currentRoot);

  if (!fiberDOMs.length) {
    return false;
  }

  // diff to unmount
  mutables.wipRoot = {
    dom: node,
    props: {
      children: [],
    },
    alternate: mutables.currentRoot,
  };
  pendingFibers.enqueue(mutables.wipRoot, true);

  reset();
  return true;
}

/**
 * we are walking the whole tree during the render phase.
 * React instead follows some hints and heuristics to skip entire sub-trees where nothing changed.
 */
export function render(reactElm: MyReactElement, node: HTMLElement) {
  mount(reactElm, node);
  workLoop(true);
}
