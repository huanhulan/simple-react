/** @jsx createElement */
import { createElement } from 'my-react';
import { FooterProps } from './interface';
import { pluralize } from './helpers';

export function TodoFooter({
  nowShowing,
  count,
  completedCount,
  onClearCompleted,
}: FooterProps) {
  return (
    // @ts-ignore
    <footer className="footer">
      {/* @ts-ignore */}
      <span className="todo-count">
        {/* @ts-ignore */}
        <strong>{count}</strong> {pluralize(count, 'item')} left
        {/* @ts-ignore */}
      </span>
      {/* @ts-ignore */}
      <ul className="filters">
        {/* @ts-ignore */}
        <li>
          {/* @ts-ignore */}
          <a href="#/" className={nowShowing === 'all' && 'selected'}>
            All
            {/* @ts-ignore */}
          </a>
          {/* @ts-ignore */}
        </li>
        {/* @ts-ignore */}
        <li>
          {/* @ts-ignore */}
          <a href="#/active" className={nowShowing === 'active' && 'selected'}>
            Active
            {/* @ts-ignore */}
          </a>
          {/* @ts-ignore */}
        </li>
        {/* @ts-ignore */}
        <li>
          {/* @ts-ignore */}
          <a
            href="#/completed"
            className={nowShowing === 'completed' && 'selected'}
          >
            Completed
            {/* @ts-ignore */}
          </a>
          {/* @ts-ignore */}
        </li>
        {/* @ts-ignore */}
      </ul>
      {completedCount > 0 && ( // @ts-ignore
        <button
          type="button"
          className="clear-completed"
          onClick={onClearCompleted}
        >
          Clear completed
          {/* @ts-ignore */}
        </button>
      )}
      {/* @ts-ignore */}
    </footer>
  );
}
