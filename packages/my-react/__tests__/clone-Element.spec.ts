import MyReact, { createElement } from '../index';

describe('cloneElement', () => {
  test('should clone components', () => {
    function Comp() {
      return null;
    }
    const instance = createElement(
      Comp,
      {
        prop1: 1,
      },
      'hello'
    );
    const clone = MyReact.cloneElement(instance);

    expect(clone.type).toEqual(instance.type);
    expect(clone.props !== instance.props).toBeTruthy(); // Should be a different object...
    expect(clone.props).toEqual(instance.props); // with the same properties
  });
  test('should merge new props', () => {
    function Foo() {
      return null;
    }
    const instance = createElement(Foo, {
      prop1: 1,
      prop2: 2,
    });
    const clone = MyReact.cloneElement(instance, { prop1: -1, newProp: -2 });

    expect(clone.type).toEqual(instance.type);
    expect(clone.props !== instance.props).toBeTruthy();
    expect(clone.props.prop1).toEqual(-1);
    expect(clone.props.prop2).toEqual(2);
    expect(clone.props.newProp).toEqual(-2);
  });
  test('should override children if specified', () => {
    function Foo() {
      return null;
    }
    const instance = createElement(Foo, {}, 'hello');
    const clone = MyReact.cloneElement(instance, {}, 'world', '!');

    expect(clone.type).toEqual(instance.type);
    expect(clone.props !== instance.props).toBeTruthy();
    expect(clone.props.children).toEqual([
      {
        type: 'TEXT_ELEMENT',
        props: {
          children: [],
          nodeValue: 'world',
        },
      },
      {
        type: 'TEXT_ELEMENT',
        props: {
          children: [],
          nodeValue: '!',
        },
      },
    ]);
  });
  test('should override children if null is provided as an argument', () => {
    function Foo() {
      return null;
    }
    const instance = createElement(Foo, {}, 'foo');
    const clone = MyReact.cloneElement(instance, { children: 'bar' }, null);

    expect(clone.type).toEqual(instance.type);
    expect(clone.props !== instance.props).toBeTruthy();
    expect(clone.props.children).toEqual([]);
  });

  test('should override key if specified', () => {
    function Foo() {
      return null;
    }
    const instance = createElement(Foo, { key: '1' }, 'foo');
    let clone = MyReact.cloneElement(instance);
    expect(clone.props.key).toEqual('1');
    clone = MyReact.cloneElement(instance, { key: '2' });
    expect(clone.props.key).toEqual('2');
  });
  test('should override ref if specified', () => {
    function a() {} // eslint-disable-line @typescript-eslint/no-empty-function
    function b() {} // eslint-disable-line @typescript-eslint/no-empty-function
    function Foo() {
      return null;
    }
    const instance = createElement(Foo, { ref: a }, 'hello');

    let clone = MyReact.cloneElement(instance);
    expect(clone.ref).toEqual(a);

    clone = MyReact.cloneElement(instance, { ref: b });
    expect(clone.ref).toEqual(b);
  });
});
