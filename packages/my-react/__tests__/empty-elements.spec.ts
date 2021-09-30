import { getExampleDOM } from 'test-utils';
import { render, createElement } from '../index';

test('Check rendering of empty child', () => {
  const container = getExampleDOM();

  render(createElement('div', {}, null), container);

  expect(container.querySelector('div')?.childNodes?.length).toBe(0);
  expect(container.querySelector('div')).toContainHTML('');
});
