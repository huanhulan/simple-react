import { fireEvent, waitFor } from '@testing-library/dom';
import { getExampleDOM, runNextTick } from 'test-utils';
import MyReact, {
  createElement,
  render,
  useLayoutEffect,
  useRef,
  useState,
  useEventCallback,
  useContext,
  unmountComponentAtNode,
} from '../index';
import {
  ComponentChildren,
  FunctionComponent,
  Ref,
  ComponentChild,
} from '../typings';

describe('Portal', () => {
  const container = getExampleDOM();

  const portalAppRoot = document.createElement('div');
  portalAppRoot.id = 'portal-app-root';
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';

  container.appendChild(portalAppRoot);
  container.appendChild(modalRoot);

  afterEach(() => {
    unmountComponentAtNode(portalAppRoot);
  });

  test('should render into a different root node, and unmounting the app should also unmount the content within the portal', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    // eslint-disable-next-line @typescript-eslint/ban-types
    const Foo: FunctionComponent<{}> = ({ children }) => {
      return createElement('div', {}, [
        MyReact.createPortal(children as any, root),
      ]);
    };
    const content = 'foobar';
    render(createElement(Foo, {}, [content]), portalAppRoot);
    expect(root.innerHTML).toEqual('foobar');
    expect(portalAppRoot.firstChild?.nodeName.toLowerCase()).toEqual('div');
    expect(portalAppRoot.children[0].innerHTML).toBeFalsy();
    unmountComponentAtNode(portalAppRoot);
    expect(root.innerHTML).toBeFalsy();
    expect(portalAppRoot.innerHTML).toBeFalsy();
    document.body.removeChild(root);
  });

  test('Plain modal should render correctly and can be toggled correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const Modal: FunctionComponent<{}> = ({ children }) => {
      const { current: el } = useRef(document.createElement('div'));
      useLayoutEffect(() => {
        modalRoot.appendChild(el as HTMLDivElement);
        return () => {
          modalRoot.removeChild(el as HTMLDivElement);
        };
      }, []);
      return MyReact.createPortal(
        // Any valid React child: JSX, strings, arrays, etc.
        children as any,
        // A DOM element
        el as HTMLDivElement,
      );
    };
    // eslint-disable-next-line @typescript-eslint/ban-types
    const App: FunctionComponent<{}> = () => {
      const [showModal, setShowModal] = useState(false);
      const handleShow = useEventCallback(() => setShowModal(true));
      const handleHide = useEventCallback(() => setShowModal(false));
      const modal = showModal
        ? createElement(Modal, {}, [
            createElement(
              'div',
              {
                className: 'modal',
              },
              [
                createElement('div', {}, [
                  `With a portal, we can render content into a different part of the DOM,
                  as if it were any other React child.`,
                  'This is being rendered inside the #modal-container div.',
                  createElement(
                    'button',
                    {
                      onClick: handleHide,
                    },
                    ['Hide modal'],
                  ),
                ]),
              ],
            ),
          ])
        : null;

      return createElement(
        'div',
        {
          className: 'app',
        },
        [
          'This div has overflow: hidden.',
          createElement(
            'button',
            {
              onClick: handleShow,
            },
            ['Show modal'],
          ),
          modal,
        ],
      );
    };
    render(createElement(App as FunctionComponent, {}), portalAppRoot);

    expect(portalAppRoot.firstChild?.nodeName.toLowerCase()).toEqual('div');
    expect(portalAppRoot.querySelector('div > button')).toBeTruthy();
    expect(modalRoot.innerHTML).toBeFalsy();
    fireEvent(
      portalAppRoot.querySelector('div > button') as HTMLButtonElement,
      new MouseEvent('click'),
    );
    runNextTick();
    await waitFor(() => {
      expect(
        modalRoot.innerHTML.includes(
          'With a portal, we can render content into a different part of the DOM',
        ),
      ).toBeTruthy();
      expect(
        modalRoot.innerHTML.includes(
          'This is being rendered inside the #modal-container div.',
        ),
      ).toBeTruthy();
      expect(modalRoot.innerHTML.includes('Hide modal')).toBeTruthy();
    });
    fireEvent(
      modalRoot.querySelector('.modal > div > button') as HTMLButtonElement,
      new MouseEvent('click'),
    );
    runNextTick();
    await waitFor(() => {
      expect(modalRoot.innerHTML).toBeFalsy();
    });
  });

  test('should notice prop changes on the portal', () => {
    let set: (p: Record<string, any>) => void = () => undefined;

    // eslint-disable-next-line @typescript-eslint/ban-types
    const Foo: FunctionComponent<{}> = () => {
      const [additionalProps, setProps] = useState<Record<string, any>>({
        style: { backgroundColor: 'red' },
      });
      set = (c) => setProps(c);
      return createElement('div', {}, [
        createElement('p', {}, ['Hello']),
        MyReact.createPortal(
          createElement('p', { ...additionalProps }, 'Foo'),
          portalAppRoot,
        ),
      ]);
    };
    render(createElement(Foo, {}, []), portalAppRoot);
    expect(
      (portalAppRoot.children[1] as HTMLParagraphElement).style.backgroundColor,
    ).toEqual('red');
    set({});
    runNextTick();
    expect(
      (portalAppRoot.children[1] as HTMLParagraphElement).style.backgroundColor,
    ).toEqual('');
    unmountComponentAtNode(portalAppRoot);
    expect(portalAppRoot.innerHTML).toBeFalsy();
  });

  test('should work with changing the container', () => {
    let set: ReturnType<typeof useState>[1] = () => undefined;
    let ref: Ref<(r: any) => void>;

    // eslint-disable-next-line @typescript-eslint/ban-types
    const Foo: FunctionComponent<{}> = ({ children }) => {
      const [portalRoot, setContainer] = useState(portalAppRoot);
      set = setContainer as any;

      return createElement(
        'div',
        {
          ref: (r: any) => {
            ref = r;
          },
        },
        [
          createElement('p', {}, 'Hello'),
          MyReact.createPortal(children as any, portalRoot),
        ],
      );
    };
    render(
      createElement(Foo, {}, [createElement('div', {}, 'foobar')]),
      portalAppRoot,
    );
    expect(portalAppRoot.innerHTML).toBe(
      '<div><p>Hello</p></div><div>foobar</div>',
    );
    runNextTick();
    set(() => ref);
    runNextTick();
    expect(portalAppRoot.innerHTML).toBe(
      '<div><p>Hello</p><div>foobar</div></div>',
    );
  });

  test('Should work with context, and should support native browser event bubbling', async () => {
    const ModalContext = MyReact.createContext<HTMLElement>();
    const ContainerStyle = {
      position: 'relative',
      'z-index': 0,
    };
    const OverlayStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.3)',
    };
    const DialogStyle = {
      background: 'white',
      'border-radius': '5px',
      padding: '20px',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      'z-index': 1,
    };
    const ModalStyle = { width: 400, textAlign: 'center' };

    // eslint-disable-next-line @typescript-eslint/ban-types
    const ModalProvider: FunctionComponent<{}> = ({ children }) => {
      const modalRef = useRef<HTMLElement>(null);
      const [modalRootDom, setModalRootDom] = useState<HTMLElement | null>(
        null,
      );

      // make sure re-render is triggered after initial
      // render so that modalRef exists
      useLayoutEffect(() => {
        setModalRootDom(modalRef.current as HTMLElement);
      }, []);

      return createElement('div', { style: ContainerStyle }, [
        createElement(
          ModalContext.Provider as any,
          { value: modalRootDom },
          children as ComponentChildren,
        ),
        createElement('div', { ref: modalRef }, []),
      ]);
    };

    const Modal: FunctionComponent<{
      onClose: () => void;
    }> = ({ onClose, children, ...props }) => {
      const modalNode = useContext(ModalContext);
      return modalNode
        ? MyReact.createPortal(
            createElement(
              'div',
              {
                id: 'overlay',
                style: OverlayStyle,
              },
              [
                createElement(
                  'div',
                  {
                    ...props,
                    style: DialogStyle,
                  },
                  [
                    children as ComponentChild,
                    createElement(
                      'button',
                      {
                        onClick: onClose,
                        id: 'modal-close-button',
                      },
                      ['Close'],
                    ),
                  ],
                ),
              ],
            ),
            modalNode,
          )
        : null;
    };

    // eslint-disable-next-line @typescript-eslint/ban-types
    const Page: FunctionComponent<{}> = () => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const openModal = useEventCallback(() => setIsModalOpen(true));
      const closeModal = useEventCallback(() => setIsModalOpen(false));
      return createElement('div', {}, [
        createElement(
          'button',
          {
            onClick: openModal,
            id: 'page-modal-button',
          },
          ['Open page modal'],
        ),
        isModalOpen &&
          createElement(
            Modal as any,
            {
              id: 'page-modal',
              onClose: closeModal,
              style: ModalStyle,
            },
            [createElement('p', {}, ['Page Modal'])],
          ),
      ]);
    };

    // eslint-disable-next-line @typescript-eslint/ban-types
    const App: FunctionComponent<{}> = () => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const parentSubmit = useEventCallback(
        jest.fn((event: Event) => {
          event.preventDefault();
        }),
      );
      const modalSubmit = useEventCallback(
        jest.fn((event: Event) => {
          event.preventDefault();
        }),
      );
      const openModal = useEventCallback(() => setIsModalOpen(true));
      const closeModal = useEventCallback(() => setIsModalOpen(false));

      return createElement(ModalProvider, {}, [
        createElement(
          'form',
          {
            onSubmit: parentSubmit,
          },
          [
            createElement('h1', {}, ['My App']),
            createElement(
              'button',
              {
                onClick: openModal,
                id: 'app-modal-button',
              },
              ['Open app modal'],
            ),
            createElement(Page, {}, []),
            isModalOpen &&
              createElement(
                Modal as any,
                {
                  onClose: closeModal,
                },
                [
                  createElement(
                    'form',
                    {
                      onSubmit: modalSubmit,
                    },
                    [
                      createElement('p', {}, ['App Modal']),
                      createElement(
                        'button',
                        {
                          id: 'submit-button',
                          type: 'submit',
                        },
                        ['Go'],
                      ),
                    ],
                  ),
                ],
              ),
          ],
        ),
      ]);
    };

    render(createElement(App as FunctionComponent, {}), portalAppRoot);

    expect(portalAppRoot.querySelector('#page-modal-button')).toBeTruthy();
    expect(portalAppRoot.querySelector('#app-modal-button')).toBeTruthy();

    fireEvent(
      portalAppRoot.querySelector('#page-modal-button') as HTMLButtonElement,
      new MouseEvent('click'),
    );
    runNextTick();
    await waitFor(() => {
      expect(portalAppRoot.querySelector('#page-modal')).toBeTruthy();
      expect(portalAppRoot.querySelector('#modal-close-button')).toBeTruthy();
      expect(portalAppRoot.querySelector('#overlay')).toBeTruthy();
    });

    fireEvent(
      portalAppRoot.querySelector('#modal-close-button') as HTMLButtonElement,
      new MouseEvent('click'),
    );
    runNextTick();
    await waitFor(() => {
      expect(portalAppRoot.querySelector('#page-modal')).toBeFalsy();
      expect(portalAppRoot.querySelector('#modal-close-button')).toBeFalsy();
      expect(portalAppRoot.querySelector('#overlay')).toBeFalsy();
    });

    fireEvent(
      portalAppRoot.querySelector('#app-modal-button') as HTMLButtonElement,
      new MouseEvent('click'),
    );
    runNextTick();
    await waitFor(() => {
      expect(portalAppRoot.querySelector('#submit-button')).toBeTruthy();
      expect(portalAppRoot.querySelector('#modal-close-button')).toBeTruthy();
      expect(portalAppRoot.querySelector('#overlay')).toBeTruthy();
    });

    const fakeOnSubmitCB = jest.fn();
    portalAppRoot.addEventListener('submit', fakeOnSubmitCB);
    fireEvent(
      portalAppRoot.querySelector('#submit-button') as HTMLButtonElement,
      new MouseEvent('click'),
    );
    runNextTick();
    expect(fakeOnSubmitCB).toHaveBeenCalledTimes(1);
    portalAppRoot.removeEventListener('submit', fakeOnSubmitCB);

    fireEvent(
      portalAppRoot.querySelector('#modal-close-button') as HTMLButtonElement,
      new MouseEvent('click'),
    );
    runNextTick();
    await waitFor(() => {
      expect(portalAppRoot.querySelector('#page-modal')).toBeFalsy();
      expect(portalAppRoot.querySelector('#modal-close-button')).toBeFalsy();
      expect(portalAppRoot.querySelector('#overlay')).toBeFalsy();
    });

    fireEvent(
      portalAppRoot.querySelector('#page-modal-button') as HTMLButtonElement,
      new MouseEvent('click'),
    );
    runNextTick();
    await waitFor(() => {
      expect(portalAppRoot.querySelector('#page-modal')).toBeTruthy();
      expect(portalAppRoot.querySelector('#modal-close-button')).toBeTruthy();
      expect(portalAppRoot.querySelector('#overlay')).toBeTruthy();
    });
  });
});
