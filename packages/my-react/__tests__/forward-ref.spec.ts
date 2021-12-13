import { getExampleDOM } from 'test-utils';
import { requestIdleCallback } from '@shopify/jest-dom-mocks';
import {
  createElement,
  render,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  unmountComponentAtNode,
} from '../index';

const container = getExampleDOM();

describe('forwardRef', () => {
  afterEach(() => unmountComponentAtNode(container));

  test('should pass ref with a callback', () => {
    const App = forwardRef((_, ref) => createElement('div', { ref }, ['foo']));
    let ref: HTMLElement = undefined as any;
    render(
      createElement(App, {
        ref: (x: HTMLElement) => {
          ref = x;
        },
      }),
      container,
    );
    requestIdleCallback.runIdleCallbacks();
    expect(ref).toBe(container.firstChild);
  });

  test('should forward props', () => {
    const spy = jest.fn();
    const App = forwardRef(spy);
    render(createElement(App, { foo: 'bar' }, []), container);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(
      (spy.mock.calls[0] as Parameters<typeof forwardRef>)[0],
    ).toStrictEqual({
      foo: 'bar',
      children: [],
    });
  });

  it('calls ref when this is a function', () => {
    const spy = jest.fn();
    const Bar = forwardRef((_, ref) => {
      useImperativeHandle(ref as any, () => ({ foo: 100 }));
      return null;
    });

    render(createElement(Bar, { ref: spy }), container);
    expect(spy).toBeCalledTimes(1);
    expect(
      (spy.mock.calls[0] as Parameters<typeof forwardRef>)[0],
    ).toStrictEqual({
      foo: 100,
    });
  });

  it('should pass undefined as ref when no ref is present', () => {
    let actual;
    const App = forwardRef((_, ref) => {
      actual = ref;
      return createElement('div', {});
    });

    render(createElement(App, {}), container);
    expect(actual).toBeFalsy();
  });

  it('should not crash when explicitly passing null', () => {
    let actual;
    const App = forwardRef((_, ref) => {
      actual = ref;
      return createElement('div', {});
    });

    // eslint-disable-next-line new-cap
    render(App({}, null as any) as any, container);
    expect(actual).toBeFalsy();
  });

  it('stale ref missing with passed useRef', () => {
    let refOutter: Ref<HTMLElement> = {} as any;
    let stateSetter: (p: any) => void = () => ({});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const Inner = forwardRef((__, ref) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, setState] = useState(null);
      refOutter = ref as any;
      stateSetter = setState;
      return createElement('div', { ref });
    });

    const Parent = () => {
      const parentRef = useRef(null);
      return createElement(
        Inner,
        {
          ref: parentRef,
        },
        ['child'],
      );
    };

    render(createElement(Parent, {}), container);

    expect((refOutter as RefObject<HTMLDivElement>)?.current).toBe(
      container.firstChild,
    );
    stateSetter(1);
    requestIdleCallback.runIdleCallbacks();
    expect((refOutter as RefObject<HTMLDivElement>)?.current).toBe(
      container.firstChild,
    );
  });

  it('calls ref when this is a function.', () => {
    const spy = jest.fn();
    const Bar = forwardRef((_, ref) => {
      useImperativeHandle(ref as any, () => ({ foo: 100 }));
      return null;
    });

    render(createElement(Bar, { ref: spy }), container);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(
      (spy.mock.calls[0] as Parameters<typeof forwardRef>)[0],
    ).toStrictEqual({
      foo: 100,
    });
  });
});
