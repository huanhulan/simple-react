import { map } from 'ramda';
import { TEXT_ELEMENT } from './constants';

export function createTextElement(text: TextChild): MyReactElement {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

export function createElement(
  type: ComponentType | string,
  props: Record<string, unknown>,
  ...children: ComponentChildren
): MyReactElement {
  return {
    type,
    props: {
      ...props,
      children: map((child) => {
        return typeof child === 'object' ? child : createTextElement(child);
      }, children),
    },
  };
}
