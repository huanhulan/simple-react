import { createElement } from './src/MyReact';
import { cloneElement } from './src/cloneElement';

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
