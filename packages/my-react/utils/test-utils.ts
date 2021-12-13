import { v4 } from 'uuid';

export function getExampleDOM() {
  const div = document.createElement('div');
  div.id = v4();
  document.body.appendChild(div);
  return div;
}
