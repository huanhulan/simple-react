import '@testing-library/jest-dom';
import { requestIdleCallback } from '@shopify/jest-dom-mocks';

requestIdleCallback.mock();
