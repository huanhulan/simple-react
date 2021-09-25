import { getExampleDOM } from 'test-utils';
import { render, createElement } from '../index';

test('Check rendering with inline styling', () => {
  const container = getExampleDOM();

  render(createElement('p', { style: { color: 'red' } }), container);

  expect(container.querySelector('[style="color: red;"]')).not.toBeNull();
});
