import { getExampleDOM } from 'test-utils';
import { render, createElement } from '../index';

test('Check rendering of a functional component with a prop', () => {
  const container = getExampleDOM();

  function Greeting(props: { name: string }) {
    return createElement('p', props, [`Hello, ${props.name}`]);
  }

  render(
    createElement(Greeting as FunctionComponent, { name: 'NDC' }),
    container,
  );

  expect(container.querySelector('p')).not.toBeNull();
  expect(container.querySelector('p')).toContainHTML('Hello, NDC');
  expect(container).toContainElement(container.querySelector('p'));
});
