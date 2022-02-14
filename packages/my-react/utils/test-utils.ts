import { v4 } from 'uuid';
import { requestIdleCallback, animationFrame } from '@shopify/jest-dom-mocks';

export function getExampleDOM() {
  const div = document.createElement('div');
  div.id = v4();
  document.body.appendChild(div);
  return div;
}

export function runNextTick() {
  requestIdleCallback.runIdleCallbacks();
  animationFrame.runFrame();
}
