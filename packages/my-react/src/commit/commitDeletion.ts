export function commitDeletion(fiber: Fiber, container: Node) {
  if (
    fiber.dom &&
    Array.from(container.childNodes).includes(fiber.dom as any)
  ) {
    container.removeChild(fiber.dom);
    return;
  }
  if (!fiber.child) {
    return;
  }
  commitDeletion(fiber.child, container);
}
