/** @jsx createElement */
import { createElement } from 'my-react';
import { TodoHeaderProps } from './interface';

export function TodoHeader({
  newTodo,
  handleNewTodoKeyDown,
  updateNewTodo,
}: TodoHeaderProps) {
  return (
    // @ts-ignore
    <header className="header">
      {/* @ts-ignore */}
      <h1>Todos</h1>
      {/* @ts-ignore */}
      <input
        className="new-todo"
        placeholder="What needs to be done?"
        value={newTodo}
        onKeyDown={handleNewTodoKeyDown}
        onInput={updateNewTodo}
    autoFocus // eslint-disable-line
      />
      {/* @ts-ignore */}
    </header>
  );
}
