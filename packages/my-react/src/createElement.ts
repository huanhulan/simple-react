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
      children: children.flat().map((child) => {
        if (child === null || child === false) {
          return null;
        }
        return typeof child === 'object' ? child : createTextElement(child);
      }),
    },
  };
}
