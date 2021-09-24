import { getExampleDOM } from 'test-utils';
import { requestIdleCallback } from '@shopify/jest-dom-mocks';
import { render, createElement } from '../index';

test('Check rendering of html element', async () => {
  const container = getExampleDOM();

  render(createElement('p', {}), container);
  requestIdleCallback.runIdleCallbacks();
  expect(container.querySelector('p')).not.toBeNull();
});
