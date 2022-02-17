import { equals } from 'ramda';
import { FunctionComponent, ComponentChild, RenderableProps } from '../typings';

function shallowEqArray(l1: any[], l2: any[]) {
  if (l1.length !== l2.length) {
    return false;
  }
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < l1.length; i++) {
    if (l1[i] !== l2[i]) {
      return false;
    }
  }
  return true;
}

function defaultComparator(
  a: Record<string, any>,
  b: Record<string, any>,
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (!equals(keysA, keysB)) {
    return false;
  }
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];

    if (Array.isArray(a[key]) && Array.isArray(b[key])) {
      if (!shallowEqArray(a[key], b[key])) {
        return false;
      }
      // eslint-disable-next-line no-continue
      continue;
    }

    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

export function memo<T extends RenderableProps<Record<string, unknown>>>(
  Component: FunctionComponent<T>,
  compare: (prop1: T, prop2: T) => boolean = defaultComparator,
) {
  let lastProp: T;
  let lastElement: ComponentChild;

  function MemoedComponent(nextProp: T) {
    if (lastProp && compare(lastProp, nextProp)) {
      return lastElement;
    }

    lastProp = nextProp;
    lastElement = Component(nextProp);
    return lastElement;
  }
  MemoedComponent.displayName = `Memo${
    Component.displayName || Component.name
  }`;
  return MemoedComponent;
}
