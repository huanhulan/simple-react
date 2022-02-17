import { cloneElement } from './src/cloneElement';
import { createContext } from './src/createContext';
import { createElement } from './src/MyReact';
import { createPortal } from './src/portal';
import { createRef } from './src/createRef';
import { memo } from './src/memo';

export * from './typings';

const MyReact = {
  cloneElement,
  createContext,
  createElement,
  createPortal,
  createRef,
  memo,
};

export default MyReact;
export * from './src/MyReact';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
