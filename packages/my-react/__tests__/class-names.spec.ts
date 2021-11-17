import { getNodeText } from '@testing-library/dom';
import faker from 'faker';

import { getExampleDOM } from 'test-utils';
import { render, createElement } from '../index';

test('Check rendering with a CSS class', () => {
  const container = getExampleDOM();
  const className = faker.lorem.word();
  const content = faker.lorem.sentence();
  render(
    createElement(
      'p',
      {
        className,
      },
      [content],
    ),
    container,
  );

  expect(container.querySelector(`.${className}`)).not.toBeNull();
  expect(
    getNodeText(
      container.querySelector(`.${className}`) as HTMLParagraphElement,
    ),
  ).toBe(content);
});
