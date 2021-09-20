/** @jsx createElement */
import { createElement } from 'my-react';
import { TodoHeaderProps } from './interface';
import { Input } from './Input';

export function TodoHeader({
  newTodo,
  handleNewTodoKeyDown,
  updateNewTodo,
}: TodoHeaderProps) {
  return (
    <header className="header">
      <h1>Todos</h1>
      <Input
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
