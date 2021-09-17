/** @jsx createElement */
import { createElement, useState } from 'my-react';
import { TodoItemProps } from './interface';

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

export function TodoItem({
  todo,
  onToggle,
  onDestroy,
  editing,
  onSave,
  onCancel,
  onEdit,
}: TodoItemProps) {
  const { title, completed, id } = todo;
  const [editText, setEditText] = useState('');
  const className = `${completed ? 'completed' : ''} ${
    editing ? ' editing' : ''
  }`;
  const toggle = (e: any) => {
    onToggle(todo);
    e.preventDefault();
  };
  const handleEdit = () => {
    onEdit(todo);
    setEditText(title);
  };
  const handleDestroy = () => {
    onDestroy(todo);
  };
  const handleSubmit = () => {
    const val = editText.trim();
    if (val) {
      onSave(todo, val);
      setEditText(val);
    } else {
      onDestroy(todo);
    }
  };

  const updateEditText = (e: any) => {
    setEditText(e?.target?.value);
  };

  const handleKeyDown = (e: any) => {
    if (e.which === ESCAPE_KEY) {
      setEditText(title);
      onCancel(todo);
    } else if (e.which === ENTER_KEY) {
      handleSubmit();
    }
  };

  return (
    <li className={className}>
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={completed}
          onClick={toggle}
          id={id}
        />

        <label onDblClick={handleEdit} htmlFor={id}>
          {title}
        </label>

        <button
          type="button"
          className="destroy"
          onClick={handleDestroy}
          aria-label="destroy"
        />
      </div>
      {editing && (
        <input
          className="edit"
          autoFocus // eslint-disable-line
          value={editText}
          onBlur={handleSubmit}
          onInput={updateEditText}
          onKeyDown={handleKeyDown}
        />
      )}
    </li>
  );
}
