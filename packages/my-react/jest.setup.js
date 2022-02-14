import '@testing-library/jest-dom';
import { requestIdleCallback, animationFrame } from '@shopify/jest-dom-mocks';

requestIdleCallback.mock();
animationFrame.mock();
