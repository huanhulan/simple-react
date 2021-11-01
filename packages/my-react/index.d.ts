type Key = import('./typings/types').Key;

declare type ComponentType<P = Record<string, unknown>> =
  import('./typings/types').ComponentType<P>;

declare type MyReactElement<P = Record<string, unknown>> =
  import('./typings/types').MyReactElement<P>;

declare type FunctionComponent<P = Record<string, unknown> & { key?: Key }> =
  import('./typings/types').FunctionComponent<P>;

declare type TextChild = import('./typings/types').TextChild;

declare type ComponentChild = import('./typings/types').ComponentChild;

declare type ComponentChildren = import('./typings/types').ComponentChildren;

declare type RenderableProps<
  P,
  RefType = any
> = import('./typings/types').RenderableProps<P, RefType>;

declare type Attributes = import('./typings/types').Attributes;

declare type RefObject<T> = import('./typings/types').RefObject<T>;

declare type RefCallback<T> = import('./typings/types').RefCallback<T>;

declare type Ref<T> = import('./typings/types').Ref<T>;

declare type StateHook<P> = import('./typings/types').StateHook<P>;

declare type MemoHook<P> = import('./typings/types').MemoHook<P>;

declare type EffectHook = import('./typings/types').EffectHook;

declare type Fiber<P = MyReactElement['props']> =
  import('./typings/types').Fiber<P>;
