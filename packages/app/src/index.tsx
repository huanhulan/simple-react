/* eslint-disable no-console */
/** @jsx createElement */
import { createElement, useState, useEffect, render } from 'my-react';

function Counter() {
  const [state, setState] = useState<number>(1);
  useEffect(() => {
    console.log('mount');
    return () => {
      console.log('unmount');
    };
  }, []);
  useEffect(() => {
    console.log(`update counter: ${state}`);
  }, [state]);
  return (
    /* @ts-ignore */
    <button type="button" onClick={() => setState((c: number) => c + 1)}>
      Count: {state}
      {/* @ts-ignore */}
    </button>
  );
}

function App() {
  const [showCounter, setShowCounter] = useState(true);
  return (
    /* @ts-ignore */
    <div>
      {showCounter && <Counter />}
      {/* @ts-ignore */}
      <button type="button" onClick={() => setShowCounter(false)}>
        remove counter
        {/* @ts-ignore */}
      </button>
      {/* @ts-ignore */}
    </div>
  );
}

render(<App />, document.getElementById('container') as HTMLDivElement);
