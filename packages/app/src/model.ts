import { v4 } from 'uuid';
import { storage } from './helpers';
import { Todo } from './components/interface';

export class TodoModel {
  todos: Todo[];

  key: string;

  onChanges: Array<(todos: Todo[]) => void> = [];

  constructor(key: string, sub?: (todos: Todo[]) => void) {
    this.key = key;
    this.todos = storage(key) || [];
    if (sub) {
      this.onChanges = [sub];
    }
  }

  registerCallback(sub: (todos: Todo[]) => void) {
    this.onChanges.push(sub);
  }

  unregisterCallback(sub: (todos: Todo[]) => void) {
    this.onChanges = this.onChanges.filter((cb) => cb !== sub);
  }

  inform() {
    storage(this.key, this.todos);
    this.onChanges.forEach((cb) => cb(this.todos));
  }

  addTodo(title: string) {
    this.todos = this.todos.concat({
      id: v4(),
      title,
      completed: false,
    });
    this.inform();
  }

  toggleAll(completed: boolean) {
    this.todos = this.todos.map((todo) => ({ ...todo, completed }));
    this.inform();
  }

  toggle(todoToToggle: Todo) {
    this.todos = this.todos.map((todo) =>
      todo !== todoToToggle ? todo : { ...todo, completed: !todo.completed }
    );
    this.inform();
  }

  destroy(todo: Todo) {
    this.todos = this.todos.filter((t) => t !== todo);
    this.inform();
  }

  save(todoToSave: Todo, title: string) {
    this.todos = this.todos.map((todo) =>
      todo !== todoToSave ? todo : { ...todo, title }
    );
    this.inform();
  }

  clearCompleted() {
    this.todos = this.todos.filter((todo) => !todo.completed);
    this.inform();
  }
}
