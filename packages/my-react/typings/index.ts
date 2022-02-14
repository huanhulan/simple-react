// TODO: Class component
// eslint-disable-next-line
export type ComponentType<P = Record<string, unknown>> = FunctionComponent<P>;

export interface MyReactElement<P = Record<string, unknown>> {
  type: ComponentType<P> | string;
  // eslint-disable-next-line
  props: P & { children: ComponentChild[] } & { key?: Key };
  // eslint-disable-next-line
  ref?: Ref<any>;
}

export type Key = string | number | any;

export type TextChild = string | number | boolean | undefined;

export type ComponentChild =
  | MyReactElement<Record<string, any>>
  | null
  | false
  | undefined;
export type ComponentChildren = Array<ComponentChild | TextChild>;

export interface FunctionComponent<P = Record<string, unknown>> {
  // eslint-disable-next-line
  (props: RenderableProps<P>, ref?: Ref<any>): MyReactElement<Record<string, any>> | null;
  displayName?: string;
  defaultProps?: Partial<P>;
  // eslint-disable-next-line no-use-before-define
  contextType?: Context<any>;
  type?: string;
}

export type RenderableProps<P, RefType = any> = P &
  // eslint-disable-next-line
  Readonly<Attributes & { children?: ComponentChildren; ref?: Ref<RefType> }>;

export interface Attributes {
  key?: Key;
  jsx?: boolean;
}

export type RefObject<T> = { current: T | null };
export type RefCallback<T> = (instance: T | null) => void;
export type Ref<T> = RefObject<T> | RefCallback<T> | null;

type Effects = 'PLACEMENT' | 'UPDATE' | 'DELETION';

export interface IHook {
  tag: string;
}

export interface ContextHook<T> extends IHook {
  // eslint-disable-next-line no-use-before-define
  context: Context<T>;
}

export interface StateHook<P> extends IHook {
  state: P;
  queue: Array<((param: P) => P) | P>;
}
export interface MemoHook<P> extends IHook {
  factory: () => P;
  deps?: any[];
  value: P;
}

export interface EffectHook extends IHook {
  effect?: () => () => void | void;
  cancel?: () => void;
  deps?: any[];
  hasChanged: boolean;
}

type Depth = number;
type Breadth = number;

export type Fiber<P = MyReactElement['props']> = {
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
  dirty?: boolean;
  // eslint-disable-next-line no-use-before-define
  context?: Record<string, ContextFiber<any>>;
  isPortal?: boolean;
  cache?: {
    children: MyReactElement['props']['children'];
  };
  weight: [Depth, Breadth];
};

type ContextFiber<T> = Fiber<{ value: T }>;

export type Context<T> = {
  Consumer: FunctionComponent<{
    children: [
      {
        type: 'TEXT_ELEMENT';
        props: {
          children: [];
          nodeValue: (value: T) => MyReactElement<any>;
        };
      },
    ];
  }>;
  Provider: FunctionComponent<{ value: T }>;
  defaultValue: T;
  id: string;
};
