/** @jsx createElement */
import { createElement, useState, render } from 'my-react';

function Counter() {
  const [state, setState] = useState<number>(1);
  const onClick = () => setState((c: number) => c + 1);
  return (
    /* @ts-ignore */
    <button type="button" onClick={onClick}>
      Count: {state}
      {/* @ts-ignore */}
    </button>
  );
}
const element = <Counter />;

render(element, document.getElementById('container') as HTMLDivElement);
