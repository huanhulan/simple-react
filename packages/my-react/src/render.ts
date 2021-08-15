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

export function render(reactElm: MyReactElement, node: HTMLElement) {
  mount(reactElm, node);
  requestIdleCallback(workLoop);
}
