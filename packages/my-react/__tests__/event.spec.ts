import { fireEvent } from '@testing-library/dom';
import { getExampleDOM } from 'test-utils';
import { render, createElement } from '../index';

test('Check rendering with a CSS class', () => {
  const container = getExampleDOM();
  const onClick = jest.fn();
  render(
    createElement('button', {
      onClick,
    }),
    container,
  );

  expect(container.querySelector('button')).not.toBeNull();
  fireEvent(
    container.querySelector('button') as HTMLButtonElement,
    new MouseEvent('click'),
  );
  expect(onClick).toHaveBeenCalled();
  fireEvent(
    container.querySelector('button') as HTMLButtonElement,
    new MouseEvent('click'),
  );
  expect(onClick).toHaveBeenCalledTimes(2);
});
