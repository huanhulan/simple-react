import { fireEvent, waitFor } from '@testing-library/dom';
import { requestIdleCallback } from '@shopify/jest-dom-mocks';
import { getExampleDOM } from 'test-utils';
import { FunctionComponent } from '../typings';
import {
  render,
  useState,
  createElement,
  useEventCallback,
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
  const [c3, setC3] = useState(3);
  const onChange1 = useEventCallback(
    (e: InputEvent & { target: HTMLInputElement }) => {
      setC1(Number(e.target.value || 0));
    },
  );
  const onChange2 = useEventCallback(
    (e: InputEvent & { target: HTMLInputElement }) => {
      setC2(Number(e.target.value || 0));
    },
  );
  const onChange3 = useEventCallback(
    (e: InputEvent & { target: HTMLInputElement }) => {
      setC3(Number(e.target.value || 0));
    },
  );
  useEffect(() => {
    onComputedChange(c1 + c2);
    return () => {
      onRelease();
    };
  }, [onComputedChange, c1, c2]);
  const computed1 = c1 + c2;
  const computed2 = computed1 + c3;
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
    createElement('input', {
      value: c3,
      onChange: onChange3,
      id: 'cell3',
      type: 'number',
    }),
    createElement('p', { id: 'computed-1' }, computed1),
    createElement('p', { id: 'computed-2' }, computed2),
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
    expect(container.querySelector('#cell1')).not.toBeNull();
    expect(container.querySelector('#cell2')).not.toBeNull();
    expect((container.querySelector('#cell1') as HTMLInputElement).value).toBe(
      '1',
    );
    expect((container.querySelector('#cell2') as HTMLInputElement).value).toBe(
      '2',
    );
    expect(container.querySelector('#computed-1')).toContainHTML('3');
    expect(container.querySelector('#computed-2')).toContainHTML('6');
  });
  test('Check state updates correctly when c1/c2 changed', async () => {
    fireEvent.change(container.querySelector('#cell1') as HTMLInputElement, {
      target: {
        value: '2',
      },
    });
    requestIdleCallback.runIdleCallbacks();

    await waitFor(() => {
      expect(container.querySelector('#computed-1')).toContainHTML('4');
    });
    await waitFor(() => {
      expect(onComputedChange).toHaveBeenCalledWith(4);
    });

    fireEvent.change(container.querySelector('#cell2') as HTMLInputElement, {
      target: {
        value: '5',
      },
    });
    requestIdleCallback.runIdleCallbacks();

    await waitFor(() => {
      expect(container.querySelector('#computed-1')).toContainHTML('7');
    });
    await waitFor(() => {
      expect(onComputedChange).toBeCalledTimes(2);
    });
    await waitFor(() => {
      expect(onRelease).toBeCalledTimes(2);
    });
    await waitFor(() => {
      expect(onComputedChange).toHaveBeenCalledWith(7);
    });
  });
  test('Check state updates correctly when c3 changed', async () => {
    fireEvent.change(container.querySelector('#cell3') as HTMLInputElement, {
      target: {
        value: '4',
      },
    });
    requestIdleCallback.runIdleCallbacks();
    await waitFor(() => {
      expect(container.querySelector('#computed-2')).toContainHTML('11');
    });
  });
});
