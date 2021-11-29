import { fireEvent, waitFor } from '@testing-library/dom';
import { requestIdleCallback } from '@shopify/jest-dom-mocks';
import { getExampleDOM } from 'test-utils';
import MyReact, { createElement, render, useContext, useState } from '../index';

const themes = {
  light: {
    background: '#eeeeee',
    foreground: '#000000',
  },
  dark: {
    background: '#222222',
    foreground: '#ffffff',
  },
};

const ThemeContext = MyReact.createContext(themes.light);
const LayoutContext = MyReact.createContext('flex');

function ThemedButton({
  onClick = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  children,
}: {
  onClick?: () => void;
  children: ComponentChildren;
}) {
  const theme = useContext(ThemeContext);
  return createElement(
    'button',
    {
      type: 'button',
      style: { background: theme.background, color: theme.foreground },
      onClick,
    },
    children,
  );
}

function Toolbar({ changeTheme }: { changeTheme: () => void }) {
  return createElement(
    'div',
    {
      className: 'tool-bar',
    },
    [
      createElement(
        ThemedButton as FunctionComponent,
        {
          onClick: changeTheme,
        },
        ['Change Theme'],
      ),
    ],
  );
}

function ToolbarWrapper(props: any) {
  return createElement(
    'div',
    {
      className: 'tool-bar-wrapper',
    },
    [createElement(Toolbar as FunctionComponent, { ...props }, [])],
  );
}

function App() {
  const [theme, setTheme] = useState(themes.dark);
  const toggleTheme = () => {
    setTheme((state) => {
      return state === themes.dark ? themes.light : themes.dark;
    });
  };

  return createElement('section', {}, [
    createElement(ThemeContext.Provider as any, { value: theme }, [
      createElement(
        Toolbar as FunctionComponent,
        { changeTheme: toggleTheme },
        [],
      ),
      createElement(
        ToolbarWrapper as FunctionComponent,
        { changeTheme: toggleTheme },
        [],
      ),
      createElement(LayoutContext.Provider as any, {}, [
        createElement(LayoutContext.Consumer as FunctionComponent, {}, [
          ((layout: string) => {
            return createElement(
              ThemeContext.Consumer as FunctionComponent,
              {},
              [
                ((themeContext: Record<string, any>) =>
                  `${layout}+${JSON.stringify(themeContext, null, 2)}`) as any,
              ],
            );
          }) as any,
        ]),
      ]),
    ]),
    createElement('section', {}, [
      createElement(ThemedButton as FunctionComponent, {}, [
        'I am styled by theme context!',
      ]),
    ]),
  ]);
}

describe('Check state updates can work for computed values', () => {
  const container = getExampleDOM();

  beforeAll(() => {
    render(createElement(App as FunctionComponent, {}), container);
  });
  test('Should render the producer/consumer and Component with useContext correctly', () => {
    expect(container.querySelector('.tool-bar-wrapper')).not.toBeNull();
    expect(
      container.querySelector('.tool-bar-wrapper > .tool-bar'),
    ).not.toBeNull();
    expect(container.querySelector('.tool-bar')).not.toBeNull();
    expect(container.querySelector('button')).not.toBeNull();
    const innerMostBtn = container.querySelector(
      '.tool-bar-wrapper > .tool-bar > button',
    );
    expect((innerMostBtn as HTMLElement)?.style).not.toBeNull();
    expect((innerMostBtn as HTMLElement)?.style?.color).toBe(
      'rgb(255, 255, 255)',
    );
    expect((innerMostBtn as HTMLElement)?.style?.background).toBe(
      'rgb(34, 34, 34)',
    );
    const outterMostBtn = container.querySelector(
      'section:nth-of-type(1) > button',
    );
    expect(outterMostBtn?.textContent).toBe('I am styled by theme context!');
    expect((outterMostBtn as HTMLElement)?.style).not.toBeNull();
    expect((outterMostBtn as HTMLElement)?.style?.color).toBe('rgb(0, 0, 0)');
    expect((outterMostBtn as HTMLElement)?.style?.background).toBe(
      'rgb(238, 238, 238)',
    );
  });
  test('Should work correctly for nested contexts', () => {
    expect(
      container.innerHTML.includes(
        `flex+${JSON.stringify(themes.dark, null, 2)}`,
      ),
    );
  });

  test('Should update context seperately for provider/consumer and useContext', async () => {
    const toolBarButton = container.querySelector(
      'button:nth-of-type(1)',
    ) as HTMLElement;
    const toolBarWrapperButton = container.querySelector(
      'div:nth-of-type(2) button:nth-of-type(1)',
    ) as HTMLElement;
    const outterMostBtn = container.querySelector(
      'section:nth-of-type(1) > button',
    );
    fireEvent(toolBarButton as HTMLButtonElement, new MouseEvent('click'));
    requestIdleCallback.runIdleCallbacks();
    await waitFor(() => {
      [toolBarButton, toolBarWrapperButton].forEach((btn) => {
        expect(btn?.style?.color).toBe('rgb(0, 0, 0)');
        expect(btn?.style?.background).toBe('rgb(238, 238, 238)');
        expect((outterMostBtn as HTMLElement)?.style).not.toBeNull();
        expect((outterMostBtn as HTMLElement)?.style?.color).toBe(
          'rgb(0, 0, 0)',
        );
        expect((outterMostBtn as HTMLElement)?.style?.background).toBe(
          'rgb(238, 238, 238)',
        );
      });
    });
    fireEvent(
      toolBarWrapperButton as HTMLButtonElement,
      new MouseEvent('click'),
    );
    requestIdleCallback.runIdleCallbacks();
    await waitFor(() => {
      [toolBarButton, toolBarWrapperButton].forEach((btn) => {
        expect(btn?.style?.color).toBe('rgb(255, 255, 255)');
        expect(btn?.style?.background).toBe('rgb(34, 34, 34)');
        expect((outterMostBtn as HTMLElement)?.style).not.toBeNull();
        expect((outterMostBtn as HTMLElement)?.style?.color).toBe(
          'rgb(0, 0, 0)',
        );
        expect((outterMostBtn as HTMLElement)?.style?.background).toBe(
          'rgb(238, 238, 238)',
        );
      });
    });
  });
});
