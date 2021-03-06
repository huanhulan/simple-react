/** @jsx createElement */
import { createElement, useEffect, useEventCallback, useState } from 'my-react';

import { TodoModel } from '../model';
import { TodoFooter } from './Footer';
import { Todo } from './interface';
import { TodoHeader } from './TodoHeader';
import { TodoItem } from './TodoItem';

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

  const handleNewTodoKeyDown = useEventCallback((e: KeyboardEvent) => {
    if (e.keyCode !== ENTER_KEY) {
      return;
    }
    e.preventDefault();

    const val = (e.target as HTMLInputElement).value.trim();
    if (val) {
      model.addTodo(val);
      setNewTodo('');
    }
  });

  const updateNewTodo = useEventCallback((e: any) => {
    setNewTodo(e.target.value);
    e.preventDefault();
  });

  const toggle = useEventCallback((todo: Todo) => {
    model.toggle(todo);
  });

  const destroy = useEventCallback((todo: Todo) => {
    model.destroy(todo);
  });

  const edit = useEventCallback((todo: Todo) => {
    setEditing(todo.id);
  });

  const save = useEventCallback((todoToSave: Todo, text: string) => {
    model.save(todoToSave, text);
    setEditing('');
  });

  const toggleAll = useEventCallback((e: MouseEvent) => {
    const { checked } = e.target as HTMLInputElement;
    model.toggleAll(checked);
    // Because we don't have controlled-component feature
    e.preventDefault();
  });

  const cancel = useEventCallback(() => {
    setEditing('');
  });

  const clearCompleted = useEventCallback(() => {
    model.clearCompleted();
  });

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
    0,
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
          disabled={!todos.length}
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
                key={todo.id}
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
