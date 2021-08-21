/** @jsx createElement */
import { createElement, useState, render } from 'my-react';

function Counter() {
  const [state, setState] = useState<number>(1);
  return (
    /* @ts-ignore */
    <h1 onClick={() => setState((c: number) => c + 1)}>
      Count: {state}
      {/* @ts-ignore */}
    </h1>
  );
}

render(<Counter />, document.getElementById('container') as HTMLDivElement);
