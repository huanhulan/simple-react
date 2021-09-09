/** @jsx createElement */
import { createElement, useState, useEffect } from 'my-react';
import { TodoModel } from '../model';
import { TodoFooter } from './Footer';
import { TodoItem } from './TodoItem';
import { TodoHeader } from './TodoHeader';
import { Todo } from './interface';

const ENTER_KEY = 13;

const FILTERS = {
  all: () => true,
  active: (todo: Todo) => !todo.completed,
  completed: (todo: Todo) => todo.completed,
};

function getRoute() {
  let nowShowing = String(window.location.hash || '')
    .split('/')
    .pop() as string;
  if (!FILTERS[nowShowing]) {
    nowShowing = 'all';
  }
  return nowShowing;
}

export function TodoMVC({ model }: { model: TodoModel }) {
  const [todos, setTodo] = useState<Todo[]>(model.todos);
  const [nowShowing, setNowShowing] = useState<string>(getRoute());
  const [newTodo, setNewTodo] = useState<string>('');
  const [editing, setEditing] = useState<string>('');
  const toggleAllId = 'toggle-all';
  const handleNewTodoKeyDown = (e: any) => {
    if (e.keyCode !== ENTER_KEY) return;
    e.preventDefault();

    const val = newTodo.trim();
    if (val) {
      model.addTodo(val);
      setNewTodo('');
    }
  };
  const updateNewTodo = (e: any) => {
    setNewTodo(e.target.value);
  };
  const toggle = (todo: Todo) => {
    model.toggle(todo);
  };
  const destroy = (todo: Todo) => {
    model.destroy(todo);
  };
  const edit = (todo: Todo) => {
    setEditing(todo.id);
  };
  const save = (todoToSave: Todo, text: string) => {
    model.save(todoToSave, text);
    setEditing('');
  };
  const toggleAll = (e: any) => {
    const { checked } = e.target;
    model.toggleAll(checked);
  };
  const cancel = () => {
    setEditing('');
  };
  const clearCompleted = () => {
    model.clearCompleted();
  };
  useEffect(() => {
    const handler = () => setNowShowing(getRoute());
    window.addEventListener('hashchange', handler);
    return () => {
      window.removeEventListener('hashchange', handler);
    };
  }, [setNowShowing]);
  useEffect(() => {
    model.registerCallback(setTodo);
    return () => {
      model.unregisterCallback(setTodo);
    };
  }, [setTodo]);
  const shownTodos = todos.filter(FILTERS[nowShowing]);
  const activeTodoCount = todos.reduce(
    (a, todo) => a + (todo.completed ? 0 : 1),
    0
  );
  const completedCount = todos.length - activeTodoCount;
  return (
    <div>
      <TodoHeader
        newTodo={newTodo}
        handleNewTodoKeyDown={handleNewTodoKeyDown}
        updateNewTodo={updateNewTodo}
      />

      <section className="main">
        <input
          className={toggleAllId}
          id={toggleAllId}
          type="checkbox"
          onClick={toggleAll}
          checked={activeTodoCount === 0 && !!todos.length}
        />
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor={toggleAllId}>Mark all as complete</label>{' '}
        {!!shownTodos.length && ( // @ts-ignore
          <ul className="todo-list">
            {shownTodos.map((todo) => (
              <TodoItem
                todo={todo}
                onToggle={toggle}
                onDestroy={destroy}
                onEdit={edit}
                editing={editing === todo.id}
                onSave={save}
                onCancel={cancel}
              />
            ))}
          </ul>
        )}
      </section>
      {!!(activeTodoCount || completedCount) && (
        <TodoFooter
          count={activeTodoCount}
          completedCount={completedCount}
          nowShowing={nowShowing}
          onClearCompleted={clearCompleted}
        />
      )}
    </div>
  );
}
