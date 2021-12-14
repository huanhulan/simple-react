import { createElement } from './createElement';
import { useEffect, useRef } from './hooks';
import { mutables } from './mutables';
import { downToFindFibersWithDom } from './libs';

interface PortalProps {
  node: MyReactElement<unknown>;
  container: HTMLElement;
}

export const Portal: FunctionComponent<PortalProps> = ({
  children,
  container,
}) => {
  const fiber = mutables.wipFiber as Fiber;
  fiber.dom = container;
  fiber.isPortal = true;
  const lastContainer = useRef<Node>(null);
  useEffect(() => {
    // the reconciliation will mark children to delete
    if (!children) {
      return;
    }
    // if container has changed, then move the children to the new one
    if (lastContainer.current && container) {
      downToFindFibersWithDom(fiber).forEach(({ dom }) => {
        container.appendChild(dom as Node);
      });
    }
    lastContainer.current = container;
  }, [container]);
  return (container ? children : null) as unknown as MyReactElement<any>;
};

export function createPortal(
  node: PortalProps['node'],
  container: PortalProps['container'],
) {
  return createElement(
    Portal as any,
    {
      container,
    },
    [node],
  );
}
