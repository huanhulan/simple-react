import { fireEvent } from '@testing-library/dom';
import { getExampleDOM, runNextTick } from 'test-utils';
import { FunctionComponent } from '../typings';
import {
  render,
  useState,
  createElement,
  useEffect,
  useLayoutEffect,
} from '../index';

describe('Execution order of useEffect and useLayoutEffect', () => {
  let logs: string[] = [];

  function Child(props: { name: string }) {
    logs.push(`render ${props.name}`);

    useEffect(() => {
      const { name } = props;
      logs.push(`effect ${props.name}`);
      return () => logs.push(`effect cleanup ${name}`);
    });

    useLayoutEffect(() => {
      const { name } = props;
      logs.push(`layout effect ${props.name}`);
      return () => logs.push(`layout cleanup ${name}`);
    });

    return createElement('p', {}, 'Child');
  }

  function Test(props: { name: string }) {
    const [s, setS] = useState(1);
    logs.push(`render ${props.name}`);

    useEffect(() => {
      const { name } = props;
      logs.push(`effect ${props.name}`);
      return () => logs.push(`effect cleanup ${name}`);
    });

    useLayoutEffect(() => {
      const { name } = props;
      logs.push(`layout effect ${props.name}`);
      return () => logs.push(`layout cleanup ${name}`);
    });

    return createElement(
      'div',
      {},
      createElement('button', { onClick: () => setS(s + 1) }, `update ${s}`),
      createElement(Child as any, { name: 'a' }),
      createElement(Child as any, { name: 'b' }),
    );
  }
  const container = getExampleDOM();

  beforeAll(() => {
    render(
      createElement(Test as FunctionComponent, { name: 'test' }),
      container,
    );
  });

  afterEach(() => {
    logs = [];
  });

  test('Should output logs order correctly during render phase', () => {
    runNextTick();
    expect(logs.join(', ')).toBe(
      'render test, render a, render b, layout effect a, layout effect b, layout effect test, effect a, effect b, effect test',
    );
  });

  test('Should output logs order correctly during update phase', () => {
    fireEvent.click(container.querySelector('button') as HTMLButtonElement);
    runNextTick();
    expect(logs.join(', ')).toBe(
      'render test, render a, render b, layout cleanup a, layout cleanup b, layout cleanup test, layout effect a, layout effect b, layout effect test, effect cleanup a, effect cleanup b, effect cleanup test, effect a, effect b, effect test',
    );
  });
});
