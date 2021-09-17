/** @jsx createElement */
import { createElement, useRef, useEffect } from 'my-react';
import { TodoHeaderProps } from './interface';

export function TodoHeader({
  newTodo,
  handleNewTodoKeyDown,
  updateNewTodo,
}: TodoHeaderProps) {
  const inputRef = useRef(null);
  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.focus();
  }, []);

  return (
    <header className="header">
      <h1>Todos</h1>
      <input
        ref={inputRef}
        className="new-todo"
        placeholder="What needs to be done?"
        value={newTodo}
        onKeyDown={handleNewTodoKeyDown}
        onInput={updateNewTodo}
        autoFocus // eslint-disable-line
      />
    </header>
  );
}
