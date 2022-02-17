import { fireEvent } from '@testing-library/dom';
import { getExampleDOM, runNextTick } from 'test-utils';
import MyReact, { createElement, render, useState, forwardRef } from '../index';

describe('memo()', () => {
  test('should work with function components', () => {
    const memoSpy = jest.fn();
    const container = getExampleDOM();

    function Foo() {
      memoSpy();
      return createElement('div', {}, 'Hello Word');
    }

    const Memoized = MyReact.memo(Foo);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    let update = (_: any) => {};
    const appSpy = jest.fn();
    function App() {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [state, setState] = useState(null);
      update = setState as any;
      appSpy();
      return createElement(Memoized as any, { state });
    }

    render(createElement(App, {}, []), container);
    expect(appSpy).toBeCalledTimes(1);
    expect(memoSpy).toBeCalledTimes(1);

    update(null);
    runNextTick();

    expect(appSpy).toBeCalledTimes(2);
    expect(memoSpy).toBeCalledTimes(1);
  });

  test('should support custom comparer functions', () => {
    const memoSpy = jest.fn();
    const container = getExampleDOM();

    function Foo() {
      memoSpy();
      return createElement('div', {}, 'Hello Word');
    }
    const comparer = jest.fn(() => true);
    const Memoized = MyReact.memo(Foo, comparer);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    let update = (_: any) => {};
    const appSpy = jest.fn();
    function App() {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [state, setState] = useState(null);
      update = setState as any;
      appSpy();
      return createElement(Memoized as any, { state });
    }

    render(createElement(App, {}, []), container);
    update(1);
    runNextTick();

    expect(appSpy).toBeCalledTimes(2);
    expect(memoSpy).toBeCalledTimes(1);
    expect(comparer).toBeCalledTimes(1);
  });

  test('should rerender when custom comparer returns false', () => {
    const memoSpy = jest.fn();
    const container = getExampleDOM();

    function Foo() {
      memoSpy();
      return createElement('div', {}, 'Hello Word');
    }
    const comparer = jest.fn(() => false);
    const Memoized = MyReact.memo(Foo, comparer);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    let update = (_: any) => {};
    const appSpy = jest.fn();
    function App() {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [state, setState] = useState(null);
      update = setState as any;
      appSpy();
      return createElement(Memoized as any, { state });
    }

    render(createElement(App, {}, []), container);
    update(1);
    runNextTick();

    expect(appSpy).toBeCalledTimes(2);
    expect(memoSpy).toBeCalledTimes(2);
    expect(comparer).toBeCalledTimes(1);
  });

  test('should pass props and nextProps to comparer fn', () => {
    const container = getExampleDOM();

    function Foo() {
      return createElement('div', {}, 'Hello Word');
    }
    const comparer = jest.fn(() => false);
    const Memoized = MyReact.memo(Foo, comparer);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    let update = (_: any) => {};
    function App() {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [state, setState] = useState(null);
      update = setState as any;
      return createElement(Memoized as any, { state });
    }

    render(createElement(App, {}, []), container);

    update(1);
    runNextTick();
    expect(comparer).toHaveBeenCalledWith(
      { state: null, children: [] },
      { state: 1, children: [] },
    );
    update(2);
    runNextTick();
    expect(comparer).toHaveBeenCalledWith(
      { state: 1, children: [] },
      { state: 2, children: [] },
    );
  });

  test('should nest without errors', () => {
    const container = getExampleDOM();

    function Foo() {
      return createElement('div', {}, 'Hello Word');
    }
    const App = MyReact.memo(MyReact.memo(Foo));
    render(createElement(App as any, {}, []), container);
    runNextTick();
    expect(container.querySelector('div')?.innerHTML).toEqual('Hello Word');
  });

  test('should pass ref through nested memos', () => {
    const container = getExampleDOM();
    const Foo = forwardRef((_, ref) => {
      return createElement('div', { ref }, 'Hello Word');
    });
    const ref: Record<string, any> = {};
    const App = MyReact.memo(MyReact.memo(Foo));
    render(createElement(App, { ref }), container);
    expect(ref.current).not.toBeUndefined();
  });

  test('should not reorder children', () => {
    const container = getExampleDOM();

    const array = [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }];
    const ListItem = MyReact.memo(
      ({
        name,
        isSelected,
        setSelected,
      }: {
        name: string;
        isSelected: boolean;
        setSelected: (name: string) => void;
      }) => {
        const handleClick = () => setSelected(name);

        return createElement(
          'li',
          {
            onClick: handleClick,
            ...(isSelected && {
              className: 'selected',
            }),
          },
          name,
        );
      },
    );
    const List = () => {
      const [selected, setSelected] = useState('');
      return createElement(
        'ol',
        {},
        array.map((item) =>
          createElement(ListItem as any, {
            isSelected: item.name === selected,
            setSelected,
            ...item,
            key: item.name,
          }),
        ),
      );
    };

    render(createElement(List, {}), container);
    expect(container.innerHTML).toBe(
      '<ol><li>A</li><li>B</li><li>C</li><li>D</li></ol>',
    );
    fireEvent.click(
      container.querySelector('li:nth-child(3)') as HTMLLIElement,
    );
    runNextTick();
    expect(container.innerHTML).toBe(
      '<ol><li>A</li><li>B</li><li class="selected">C</li><li>D</li></ol>',
    );
  });
});
