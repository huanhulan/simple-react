/* eslint-disable */

// TODO: Class component
declare type ComponentType<P = Record<string, unknown>> = FunctionComponent<P>;

declare interface MyReactElement<P = Record<string, unknown>> {
  type: ComponentType<P> | string;
  props: P & { children: ComponentChildren } & { key?: Key };
}

declare type Key = string | number | any;

declare type TextChild = string | number | boolean | null | undefined;

declare type ComponentChild = MyReactElement<any>;
declare type ComponentChildren = ComponentChild[];

declare interface FunctionComponent<P = Record<string, unknown>> {
  (props: RenderableProps<P>, context?: any): VNode<any> | null;
  displayName?: string;
  defaultProps?: Partial<P>;
}

declare type RenderableProps<P, RefType = any> = P &
  Readonly<Attributes & { children?: ComponentChildren; ref?: Ref<RefType> }>;

declare interface Attributes {
  key?: Key;
  jsx?: boolean;
}

declare type RefObject<T> = { current: T | null };
declare type RefCallback<T> = (instance: T | null) => void;
declare type Ref<T> = RefObject<T> | RefCallback<T>;

declare type Fiber = {
  type: MyReactElement["type"];
  dom?: HTMLElement;
  props: MyReactElement["props"];
  alternate?: Fiber;
  child?: Fiber;
  parent?: Fiber;
};
