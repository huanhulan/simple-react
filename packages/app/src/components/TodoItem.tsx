/** @jsx createElement */
import {
  createElement,
  useState,
  useEventCallback,
  FunctionComponent,
} from 'my-react';
import { TodoItemProps } from './interface';
import { Input } from './Input';

const ESCAPE_KEY = 'ESCAPE';
const ENTER_KEY = 'ENTER';

export const TodoItem: FunctionComponent<TodoItemProps> = ({
  todo,
  onToggle,
  onDestroy,
  editing,
  onSave,
  onCancel,
  onEdit,
}: TodoItemProps) => {
  const { title, completed, id } = todo;
  const [editText, setEditText] = useState('');
  const className = [completed ? 'completed' : '', editing ? ' editing' : '']
    .filter((s) => !!s)
    .join(' ');
  const toggle = useEventCallback(() => {
    onToggle(todo);
  });

  let escapePressed = false;

  const handleEdit = useEventCallback((e: MouseEvent) => {
    onEdit(todo);
    setEditText(title);
    e.preventDefault();
  });

  const handleDestroy = useEventCallback(() => {
    onDestroy(todo);
  });

  const handleSubmit = useEventCallback(() => {
    if (escapePressed) {
      return;
    }
    const val = editText.trim();
    if (val) {
      onSave(todo, val);
      setEditText(val);
    } else {
      onDestroy(todo);
    }
  });

  const updateEditText = (e: any) => {
    setEditText(e?.target?.value);
  };

  const handleKeyDown = useEventCallback((e: KeyboardEvent) => {
    if (e.key.toUpperCase() === ESCAPE_KEY) {
      setEditText(title);
      onCancel(todo);
      escapePressed = true;
    } else if (e.key.toUpperCase() === ENTER_KEY) {
      handleSubmit();
    }
  });

  const handleLabelClick = useEventCallback((e: MouseEvent) =>
    e.preventDefault()
  );

  return (
    <li className={className}>
      <div className="view">
        <Input
          className="toggle"
          type="checkbox"
          checked={completed}
          onChange={toggle}
          id={id}
        />
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
        <label onDblClick={handleEdit} htmlFor={id} onClick={handleLabelClick}>
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
        <Input
          type="input"
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
};
