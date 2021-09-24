import { requestIdleCallback } from "@shopify/jest-dom-mocks";
import { getExampleDOM } from "test-utils";
import { render, createElement } from "../index";

test("Check rendering with inline styling", async () => {
  const container = getExampleDOM();

  render(createElement("p", { style: { color: "red" } }), container);
  requestIdleCallback.runIdleCallbacks();

  expect(container.querySelector('[style="color: red;"]')).not.toBeNull();
});
