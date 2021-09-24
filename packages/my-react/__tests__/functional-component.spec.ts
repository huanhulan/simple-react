import { render, createElement } from "../index";
import { getExampleDOM } from "test-utils";
import { requestIdleCallback } from "@shopify/jest-dom-mocks";

test("Check rendering of a functional component with a prop", async () => {
  const container = getExampleDOM();

  function Greeting(props: { name: string }) {
    return createElement("p", props, [`Hello, ${props.name}`]);
  }

  render(
    createElement(Greeting as FunctionComponent, { name: "NDC" }),
    container
  );

  requestIdleCallback.runIdleCallbacks();

  expect(container.querySelector("p")).not.toBeNull();
  expect(container.querySelector("p")).toContainHTML("Hello, NDC");
  expect(container).toContainElement(container.querySelector("p"));
});
