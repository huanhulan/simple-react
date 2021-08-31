/** @jsx createElement */
import { createElement } from 'my-react';
import { TodoHeaderProps } from './interface';

export function TodoHeader({
  newTodo,
  handleNewTodoKeyDown,
  updateNewTodo,
}: TodoHeaderProps) {
  return (
    <header className="header">
      <h1>Todos</h1>
      <input
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
