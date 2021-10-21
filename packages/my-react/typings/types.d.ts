// TODO: Class component
// eslint-disable-next-line
declare type ComponentType<P = Record<string, unknown>> = FunctionComponent<P>;

declare interface MyReactElement<P = Record<string, unknown>> {
  type: ComponentType<P> | string;
  // eslint-disable-next-line
  props: P & { children: ComponentChild[] } & { key?: Key };
  // eslint-disable-next-line
  ref?: Ref<any>;
}

declare type Key = string | number | any;

declare type TextChild = string | number | boolean | undefined;

declare type ComponentChild =
  | MyReactElement<Record<string, any>>
  | null
  | false
  | undefined;
declare type ComponentChildren = Array<ComponentChild | TextChild>;

declare interface FunctionComponent<P = Record<string, unknown>> {
  // eslint-disable-next-line
  (props: RenderableProps<P>, ref?: Ref<any>): MyReactElement<Record<string, any>> | null;
  displayName?: string;
  defaultProps?: Partial<P>;
}

declare type RenderableProps<P, RefType = any> = P &
  // eslint-disable-next-line
  Readonly<Attributes & { children?: ComponentChildren; ref?: Ref<RefType> }>;

declare interface Attributes {
  key?: Key;
  jsx?: boolean;
}

declare type RefObject<T> = { current: T | null };
declare type RefCallback<T> = (instance: T | null) => void;
declare type Ref<T> = RefObject<T> | RefCallback<T>;

type Effects = 'PLACEMENT' | 'UPDATE' | 'DELETION';

interface IHook {
  tag: string;
}

declare interface StateHook<P> extends IHook {
  state: P;
  queue: Array<((param: P) => P) | P>;
}
declare interface MemoHook<P> extends IHook {
  factory: () => P;
  deps?: any[];
  value: P;
}

declare interface EffectHook extends IHook {
  effect?: () => () => void | void;
  cancel?: () => void;
  deps?: any[];
  hasChanged: boolean;
}

declare type Fiber<P = MyReactElement['props']> = {
  key?: Key;
  type?: MyReactElement['type'];
  dom?: Node;
  props: P;
  // a link to the old fiber
  alternate?: Fiber;
  child?: Fiber;
  parent?: Fiber;
  sibling?: Fiber;
  effectTag?: Effects;
  // to the fiber to support calling useState several times in the same component
  hooks?: IHook[];
  ref?: Ref<any> | null;
};
