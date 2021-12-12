import { getExampleDOM } from 'test-utils';
import MyReact, {
  createElement,
  render,
  useEffect,
  useRef,
  useState,
  useEventCallback,
  useContext,
  unmountComponentAtNode,
} from '../index';

describe('Plain portal', () => {
  const container = getExampleDOM();
  // These two containers are siblings in the DOM
  const plainModalTestRoot = document.createElement('div');
  plainModalTestRoot.id = 'app-root';
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';

  container.appendChild(plainModalTestRoot);
  container.appendChild(modalRoot);

  // eslint-disable-next-line @typescript-eslint/ban-types
  const Modal: FunctionComponent<{}> = ({ children }) => {
    const { current: el } = useRef(document.createElement('div'));
    useEffect(() => {
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
  beforeAll(() => {
    render(createElement(App as FunctionComponent, {}), plainModalTestRoot);
  });
  afterAll(() => unmountComponentAtNode(plainModalTestRoot));

  test('Should render correctly', () => {
    // TODO: write tests
    expect(true).toBeTruthy();
  });
});

describe('Portal with context', () => {
  const container = getExampleDOM();
  const Context = MyReact.createContext<HTMLElement>();
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
    const [context, setContext] = useState<HTMLElement | null>(null);

    // make sure re-render is triggered after initial
    // render so that modalRef exists
    useEffect(() => {
      setContext(modalRef.current as HTMLElement);
    }, []);

    return createElement('div', { style: ContainerStyle }, [
      createElement(
        Context.Provider as any,
        { value: context },
        children as ComponentChildren,
      ),
      createElement('div', { ref: modalRef }, []),
    ]);
  };

  const Modal: FunctionComponent<{
    onClose: () => void;
  }> = ({ onClose, children, ...props }) => {
    const modalNode = useContext(Context);
    return modalNode
      ? MyReact.createPortal(
          createElement(
            'div',
            {
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
        },
        ['Open page modal'],
      ),
      isModalOpen &&
        createElement(
          Modal as any,
          {
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

  beforeAll(() => {
    render(createElement(App as FunctionComponent, {}), container);
  });
  afterAll(() => unmountComponentAtNode(container));

  test('Should render correctly', () => {
    // TODO: write tests
    expect(true).toBeTruthy();
  });
});
