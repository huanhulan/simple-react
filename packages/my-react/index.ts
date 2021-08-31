import { createElement } from './src/MyReact';

const MyReact = {
  createElement,
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
