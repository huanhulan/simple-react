import { getExampleDOM } from "test-utils";
import { render, createElement } from "../index";

test("Check rendering with inline styling", async () => {
  const container = getExampleDOM();

  render(createElement("p", { style: { color: "red" } }), container);

  expect(container.querySelector('[style="color: red;"]')).not.toBeNull();
});
