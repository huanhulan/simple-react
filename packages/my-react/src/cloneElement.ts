import { createElement } from './createElement';

export function cloneElement<
  P extends Record<string, any>,
  T extends Partial<P>
>(
  element: MyReactElement<P>,
  config: T = {} as T,
  ...children: ComponentChildren
) {
  return createElement(
    element.type as MyReactElement['type'],
    { ...element.props, ...config },
    children?.length ? children : element.props.children
  );
}
