import { fireEvent, waitFor } from '@testing-library/dom';
import { requestIdleCallback } from '@shopify/jest-dom-mocks';

import { getExampleDOM } from 'test-utils';
import { render, useState, createElement } from '../index';

function Greeting({ newState }: { newState: string }) {
  const [name, setName] = useState('world');
  return createElement(
    'div',
    {},
    createElement('p', {}, 'Hello ', name),
    createElement(
      'button',
      {
        onClick: () => setName(newState),
      },
      'Expand your horizon',
    ),
  );
}

test('Check state updates correctly updates the DOM (fails with timeout if ReactDOM._reRender does not correctly defer rendering)', async () => {
  const container = getExampleDOM();

  render(
    createElement(Greeting as FunctionComponent, {
      newState: 'universe',
    }),
    container,
  );

  expect(container.querySelector('p')).toContainHTML('Hello world');
  expect(container.querySelector('button')).not.toBeNull();

  fireEvent(
    container.querySelector('button') as HTMLButtonElement,
    new MouseEvent('click'),
  );
  requestIdleCallback.runIdleCallbacks();

  await waitFor(() => {
    expect(container.querySelector('p')).toContainHTML('Hello universe');
  });
});
