import { fireEvent } from '@testing-library/dom';
import { getExampleDOM } from 'test-utils';
import { requestIdleCallback } from '@shopify/jest-dom-mocks';
import faker from 'faker';
import { render, createElement, useState, useCallback } from '../index';

test('Check rendering of a functional component with a prop', () => {
  const container = getExampleDOM();
  const testData = [
    new Array(
      faker.random.number({
        min: 1,
        max: 200,
      })
    ),
  ]
    .fill([])
    .map(() => faker.lorem.sentence());
  function Greeting({ contents }: { contents: string[] }) {
    const [realContents, setRealContents] = useState(contents);
    const removeLastLine = useCallback(() => {
      const idx = realContents.length - 1;
      const rest = realContents.slice(0, idx < 0 ? 0 : idx);
      setRealContents(rest);
    }, [setRealContents, realContents]);

    return createElement('div', {}, [
      ...realContents.map((str) => createElement('p', {}, [str])),
      createElement(
        'button',
        {
          onClick: removeLastLine,
        },
        ['click to delete a line']
      ),
    ]);
  }

  render(
    createElement(Greeting as FunctionComponent, { contents: testData }),
    container
  );

  expect(container.querySelectorAll('p')?.length).toBe(testData.length);

  // eslint-disable-next-line no-plusplus
  for (let i = testData.length - 1; i > -1; i--) {
    fireEvent(
      container.querySelector('button') as HTMLButtonElement,
      new MouseEvent('click')
    );
    requestIdleCallback.runIdleCallbacks();
    expect(container.querySelectorAll('p')?.length).toBe(i);
  }
});
