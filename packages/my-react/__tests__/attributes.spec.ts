import faker from 'faker';

import { getExampleDOM } from 'test-utils';
import { render, createElement } from '../index';

test('Check rendering with a CSS class', () => {
  const container = getExampleDOM();
  const value = faker.lorem.sentence();
  render(
    createElement('input', {
      value,
    }),
    container
  );

  expect(container.querySelector('input')).not.toBeNull();
  expect((container.querySelector('input') as HTMLInputElement).value).toBe(
    value
  );
});
