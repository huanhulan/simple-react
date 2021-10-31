import faker from 'faker';
import { createElement } from '../index';

const data = new Array<unknown>(faker.datatype.number)
  .fill(1)
  .map(() =>
    new Array<unknown>(faker.datatype.number)
      .fill(1)
      .map(() => faker.lorem.word())
  );

test.each(data)('Check creation of React elements', (...testData) => {
  const prop = faker.datatype.string();
  const element = createElement('p', { myProp: prop }, ...testData);

  expect(element.props.children).toEqual(
    testData.map((str) => ({
      type: 'TEXT_ELEMENT',
      props: {
        children: [],
        nodeValue: str,
      },
    }))
  );
  expect(element.props.myProp).toBe(prop);
});

test.each(data)(
  'Check createElement handles an array of children',
  (...testData) => {
    const prop = faker.datatype.string();
    const element = createElement('p', { myProp: prop }, testData);

    expect(element.props.children).toEqual(
      testData.map((str) => ({
        type: 'TEXT_ELEMENT',
        props: {
          children: [],
          nodeValue: str,
        },
      }))
    );
    expect(element.props.myProp).toBe(prop);
  }
);

test('Check createElement can be nested', () => {
  const prop = faker.datatype.string();
  const anotherProp = faker.datatype.string();
  const element = createElement(
    'p',
    { myProp: prop },
    createElement('p', { myAnotherProp: anotherProp })
  );

  expect(element.props.children).toEqual([
    {
      props: { children: [], myAnotherProp: anotherProp },
      ref: undefined,
      type: 'p',
    },
  ]);
  expect(element.props.myProp).toBe(prop);
});
