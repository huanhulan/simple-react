import { getExampleDOM } from "test-utils";
import { render, createElement } from "../index";

test("Check rendering of a primitive type child", () => {
  const container = getExampleDOM();

  render(
    createElement(
      "div",
      {},
      "Hello universe",
      createElement("p", {}, "Hello world")
    ),
    container
  );

  expect(container.querySelector("div")).toContainHTML("Hello universe");
  expect(container.querySelector("div")).toContainHTML("Hello world");
});
