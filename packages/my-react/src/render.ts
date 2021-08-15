import { omit, forEach, keys, isNil } from 'ramda';

import { workLoop } from './concurrency';
import { TEXT_ELEMENT, ROOT_KEY } from './constants';

function mount(reactElm: MyReactElement, node: HTMLElement) {
  node.setAttribute('data-root', ROOT_KEY);

  if (isNil(reactElm)) {
    return;
  }

  function instantiateElm(element: MyReactElement) {
    const { props } = element;

    const dom =
      element.type === TEXT_ELEMENT
        ? document.createTextNode('')
        : document.createElement(element.type as string);

    forEach((propName: string) => {
      if (dom.nodeType === 3) {
        dom[propName] = props[propName];
        return;
      }
      (dom as HTMLElement).setAttribute(propName, props[propName] as any);
    }, omit(['children'], keys(props)));

    const { children } = props;
    // eslint-disable-next-line no-unused-expressions
    Array.isArray(children)
      ? forEach(
          (child) => mount(child, dom as HTMLElement),
          children as MyReactElement[]
        )
      : mount(children as MyReactElement, dom as HTMLElement);

    return dom;
  }

  node.appendChild(instantiateElm(reactElm));
  requestIdleCallback(workLoop);
}

export function render(reactElm: MyReactElement, node: HTMLElement) {
  return mount(reactElm, node);
}
