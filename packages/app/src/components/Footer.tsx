/** @jsx createElement */
import { createElement } from 'my-react';
import { FooterProps } from './interface';
import { pluralize } from '../helpers';

export function TodoFooter({
  nowShowing,
  count,
  completedCount,
  onClearCompleted,
}: FooterProps) {
  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{count}</strong> {pluralize(count, 'item')} left
      </span>
      <ul className="filters">
        <li>
          <a href="#/" className={nowShowing === 'all' && 'selected'}>
            All
          </a>
        </li>

        <li>
          <a href="#/active" className={nowShowing === 'active' && 'selected'}>
            Active
          </a>
        </li>

        <li>
          <a
            href="#/completed"
            className={nowShowing === 'completed' && 'selected'}
          >
            Completed
          </a>
        </li>
      </ul>
      {completedCount > 0 && ( // @ts-ignore
        <button
          type="button"
          className="clear-completed"
          onClick={onClearCompleted}
        >
          Clear completed
        </button>
      )}
    </footer>
  );
}
