import { getExampleDOM } from 'test-utils';
import { render, createElement, unmountComponentAtNode } from '../index';

function XSSTest({ str }: { str: string }) {
  return createElement('p', { id: 'str' }, str);
}

const container = getExampleDOM();

describe('Cross-site scripting attack testing', () => {
  beforeAll(() => {
    unmountComponentAtNode(container);

    global.alert = jest.fn();
  });
  test('JSDom should be setup correctly to allow script tag execution ', () => {
    const s = document.createElement('script');
    s.innerHTML = 'alert("123")';
    document.body.appendChild(s);
    expect(global.alert).toHaveBeenCalledWith('123');
  });
  test('script tag string shall not be executed', () => {
    render(
      createElement(XSSTest as FunctionComponent, {
        str: '<script>alert(123)</script>',
      }),
      container
    );
    expect(global.alert).not.toHaveBeenCalled();
  });
  test('recursive script tag string shall not be executed', () => {
    render(
      createElement(XSSTest as FunctionComponent, {
        str: '<scr<script>ipt>alert(document.cookie)</script>',
      }),
      container
    );
    expect(global.alert).not.toHaveBeenCalled();
  });
  // eslint-disable-next-line quotes
  test.each(['>', '<', '&', "'", '"'])(
    'shall render special character: %p correctly',
    (str) => {
      render(
        createElement(XSSTest as FunctionComponent, {
          str,
        }),
        container
      );
      expect(container.querySelector('#str')).toHaveTextContent(str);
    }
  );
  test('input tag shall not be insert', () => {
    render(
      createElement(XSSTest as FunctionComponent, {
        str: '<input type="text" name="state" value="INPUT_FROM_USER">',
      }),
      container
    );
    expect(container.querySelector('#str')?.querySelector('input')).toBeNull();
  });
});
