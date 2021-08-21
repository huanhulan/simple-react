const isStyle = (key: string) => key === 'style';
const isEvent = (key: string) => key.startsWith('on');
const isProperty = (key: string) =>
  key !== 'children' && !isEvent(key) && !isStyle(key);
const isNew =
  (prev: Record<string, any>, next: Record<string, any>) => (key: string) =>
    prev[key] !== next[key];
const isGone = (next: Record<string, any>) => (key: string) => !(key in next);

export function updateDom(
  dom: Node,
  prevProps: Fiber['props'],
  nextProps: Fiber['props']
) {
  const prevStyle = (prevProps.style || {}) as Record<string, string>;
  const nextStyle = (nextProps.style || {}) as Record<string, string>;

  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name] as any);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name] as any);
    });

  // Remove old styles
  Object.keys(prevStyle)
    .filter(isGone(nextStyle))
    .forEach((name) => {
      (dom as HTMLElement).style[name] = '';
    });

  // Set new or changed styles
  Object.keys(nextStyle)
    .filter(isNew(prevStyle, nextStyle))
    .forEach((name) => {
      (dom as HTMLElement).style[name] = nextStyle[name];
    });
}
