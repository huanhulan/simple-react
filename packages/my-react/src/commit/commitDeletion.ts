export function commitDeletion(fiber: Fiber, container: HTMLElement) {
  if (fiber.dom) {
    container.removeChild(fiber.dom);
    return;
  }
  if (!fiber.child) {
    return;
  }
  commitDeletion(fiber.child, container);
}
