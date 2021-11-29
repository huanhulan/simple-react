import { cloneElement } from './src/cloneElement';
import { createContext } from './src/createContext';
import { createElement } from './src/MyReact';

export * from './typings/types';

const MyReact = {
  createElement,
  cloneElement,
  createContext,
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
