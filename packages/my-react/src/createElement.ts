import { isNil } from 'ramda';
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
  props: Record<string, any>,
  ...children: ComponentChildren | ComponentChildren[]
): MyReactElement {
  return {
    type,
    props: {
      ...props,
      children: children
        .flat()
        .filter((child) => !(isNil(child) || child === false))
        .map((child) => {
          return typeof child === 'object' ? child : createTextElement(child);
        }),
    },
    ref: props?.ref,
  };
}
