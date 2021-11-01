import { createElement } from './src/MyReact';
import { cloneElement } from './src/cloneElement';

export * from './typings/types';

const MyReact = {
  createElement,
  cloneElement,
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
