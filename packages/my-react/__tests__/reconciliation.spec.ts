import { fireEvent, waitFor } from '@testing-library/dom';
import { requestIdleCallback } from '@shopify/jest-dom-mocks';
import { getExampleDOM } from 'test-utils';
import {
  render,
  useState,
  createElement,
  useCallback,
  useEffect,
  unmountComponentAtNode,
} from '../index';
import { FunctionComponent } from '../typings';

describe('reconciliation should works fine', () => {
  let onComponentWillUnmounts: jest.Mock[] = [];
  const container = getExampleDOM();

  const Count = ({ n }: { n: number }) => {
    useEffect(() => {
      const fakeComponentWillUnmount = jest.fn();
      onComponentWillUnmounts.push(fakeComponentWillUnmount);
      return fakeComponentWillUnmount;
    }, [n]);
    return createElement('p', {}, n);
  };

  function App({ withKey = true }: { withKey?: boolean }) {
    const [list, setList] = useState(
      new Array(100).fill(1).map((_, idx) => idx),
    );
    const [desc, setDesc] = useState(false);
    const onSort = useCallback(() => {
      const newVal = !desc;
      setDesc(newVal);
      if (newVal) {
        setList(list.sort((l, r) => r - l));
      } else {
        setList(list.sort((l, r) => l - r));
      }
    }, [setDesc]);

    return createElement(
      'div',
      {},
      createElement(
        'button',
        { onClick: onSort },
        `sort ${desc ? 'ascend' : 'decend'}`,
      ),
      ...list.map((n) =>
        createElement(Count as FunctionComponent, {
          n,
          ...(withKey && {
            key: n,
          }),
        }),
      ),
    );
  }
  beforeEach(() => {
    onComponentWillUnmounts = [];
  });

  afterEach(() => {
    unmountComponentAtNode(container);
  });

  test('should not call update when sort when key is provided', async () => {
    render(createElement(App as FunctionComponent, {}), container);
    onComponentWillUnmounts.forEach((fakeFn) => {
      expect(fakeFn).not.toHaveBeenCalled();
    });
    fireEvent(
      container.querySelector('button') as HTMLButtonElement,
      new MouseEvent('click'),
    );
    requestIdleCallback.runIdleCallbacks();

    await waitFor(() => {
      onComponentWillUnmounts.forEach((fakeFn) => {
        expect(fakeFn).not.toHaveBeenCalled();
      });
    });
  });

  test('should call update when sort when key is missing', async () => {
    render(
      createElement(App as FunctionComponent, { withKey: false }),
      container,
    );
    onComponentWillUnmounts.forEach((fakeFn) => {
      expect(fakeFn).not.toHaveBeenCalled();
    });
    fireEvent(
      container.querySelector('button') as HTMLButtonElement,
      new MouseEvent('click'),
    );
    requestIdleCallback.runIdleCallbacks();
    await waitFor(() => {
      onComponentWillUnmounts
        .filter((_, idx) => idx < 100) // only the cancel hooks belong to the last reconciliation loop should get called
        .forEach((fakeFn) => {
          expect(fakeFn).toHaveBeenCalledTimes(1);
        });
    });
  });
});
