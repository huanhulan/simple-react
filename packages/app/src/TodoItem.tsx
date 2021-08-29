/* @ts-nocheck */
/** @jsx createElement */
import { createElement, useState } from 'my-react';
import { v4 } from 'uuid';
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
  const { title, completed } = todo;
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
  const id = v4();

  return (
    // @ts-ignore
    <li className={className}>
      {/* @ts-ignore */}
      <div className="view">
        {/* @ts-ignore */}
        <input
          className="toggle"
          type="checkbox"
          checked={completed}
          onChange={toggle}
          id={id}
        />
        {/* @ts-ignore */}
        <label onDblClick={handleEdit} htmlFor={id}>
          {title}
          {/* @ts-ignore */}
        </label>
        {/* @ts-ignore */}
        <button
          type="button"
          className="destroy"
          onClick={handleDestroy}
          aria-label="destroy"
        />
        {/* @ts-ignore */}
      </div>
      {editing && ( // @ts-ignore
        <input
          className="edit"
          autoFocus // eslint-disable-line
          value={editText}
          onBlur={handleSubmit}
          onInput={updateEditText}
          onKeyDown={handleKeyDown}
        />
      )}
      {/* @ts-ignore */}
    </li>
  );
}
