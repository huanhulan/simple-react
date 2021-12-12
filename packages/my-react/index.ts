import { cloneElement } from './src/cloneElement';
import { createContext } from './src/createContext';
import { createElement } from './src/MyReact';
import { createPortal } from './src/portal';

export * from './typings/types';

const MyReact = {
  cloneElement,
  createContext,
  createElement,
  createPortal,
};

export default MyReact;
export * from './src/MyReact';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: MyReactElement;
    }
  }
}
