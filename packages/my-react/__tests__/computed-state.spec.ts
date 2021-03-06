import { fireEvent, waitFor } from '@testing-library/dom';
import { getExampleDOM, runNextTick } from 'test-utils';
import { FunctionComponent } from '../typings';
import {
  render,
  useState,
  createElement,
  useCallback,
  useEffect,
} from '../index';

function Excel({
  onComputedChange,
  onRelease,
}: {
  onComputedChange: (v: number) => void;
  onRelease: () => void;
}) {
  const [c1, setC1] = useState(1);
  const [c2, setC2] = useState(2);
  const onChange1 = useCallback(
    (e: InputEvent & { target: HTMLInputElement }) => {
      setC1(Number(e.target.value || 0));
    },
    [setC1],
  );
  const onChange2 = useCallback(
    (e: InputEvent & { target: HTMLInputElement }) => {
      setC2(Number(e.target.value || 0));
    },
    [setC2],
  );
  useEffect(() => {
    onComputedChange(c1 + c2);
    return () => {
      onRelease();
    };
  }, [onRelease, onComputedChange, c1, c2]);
  return createElement(
    'div',
    {},
    createElement('input', {
      value: c1,
      onChange: onChange1,
      id: 'cell1',
      type: 'number',
    }),
    createElement('input', {
      value: c2,
      onChange: onChange2,
      id: 'cell2',
      type: 'number',
    }),
    createElement('p', {}, c1 + c2),
  );
}
const container = getExampleDOM();
const onComputedChange = jest.fn();
const onRelease = jest.fn();

describe('Check state updates can work for computed values', () => {
  beforeAll(() => {
    render(
      createElement(Excel as FunctionComponent, {
        onComputedChange,
        onRelease,
      }),
      container,
    );
  });
  test('Should render the component correctly', () => {
    expect(container.querySelector('p')).toContainHTML('3');
    expect(container.querySelector('#cell1')).not.toBeNull();
    expect(container.querySelector('#cell2')).not.toBeNull();
    expect((container.querySelector('#cell1') as HTMLInputElement).value).toBe(
      '1',
    );
    expect((container.querySelector('#cell2') as HTMLInputElement).value).toBe(
      '2',
    );
  });
  test('Check state updates correctly when c1/c2 changed', async () => {
    fireEvent.change(container.querySelector('#cell1') as HTMLInputElement, {
      target: {
        value: '2',
      },
    });
    runNextTick();

    await waitFor(() => {
      expect(container.querySelector('p')).toContainHTML('4');
    });
    await waitFor(() => {
      expect(onComputedChange).toHaveBeenCalledWith(4);
    });

    fireEvent.change(container.querySelector('#cell2') as HTMLInputElement, {
      target: {
        value: '5',
      },
    });
    runNextTick();

    await waitFor(() => {
      expect(container.querySelector('p')).toContainHTML('7');
    });
    await waitFor(() => {
      // mount, c1 change, c2 changed
      expect(onComputedChange).toBeCalledTimes(3);
    });
    await waitFor(() => {
      // c1 change, c2 changed
      expect(onRelease).toBeCalledTimes(2);
    });
    await waitFor(() => {
      // should render 7
      expect(onComputedChange).toHaveBeenCalledWith(7);
    });
  });
});
