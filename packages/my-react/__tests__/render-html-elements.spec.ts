import { getExampleDOM } from 'test-utils';
import { render, createElement } from '../index';

test('Check rendering of html element', async () => {
  const container = getExampleDOM();

  render(createElement('p', {}), container);
  
  expect(container.querySelector('p')).not.toBeNull();
});
