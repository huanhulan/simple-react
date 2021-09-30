import { getExampleDOM } from 'test-utils';
import { render, createElement } from '../index';

test('Check rendering of a child', () => {
  const container = getExampleDOM();

  render(createElement('p', {}, [createElement('span', {})]), container);

  expect(container.querySelector('p')).not.toBeNull();
  expect(container.querySelector('span')).not.toBeNull();
  expect(container.querySelector('p')?.querySelector('span')).not.toBeNull();
});
