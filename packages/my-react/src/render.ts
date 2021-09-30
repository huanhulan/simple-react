import { isNil } from 'ramda';
import { mutables } from './mutables';
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
  mutables.nextUnitOfWork = mutables.wipRoot;
}

/**
 * we are walking the whole tree during the render phase.
 * React instead follows some hints and heuristics to skip entire sub-trees where nothing changed.
 */
export function render(reactElm: MyReactElement, node: HTMLElement) {
  mount(reactElm, node);
  workLoop();
}
