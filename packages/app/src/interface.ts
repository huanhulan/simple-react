export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export type TodoItemProps = {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDestroy: (todo: Todo) => void;
  editing: boolean;
  onSave: (todo: Todo, newTodo: string) => void;
  onCancel: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
};

export interface FooterProps {
  nowShowing: string;
  count: number;
  completedCount: number;
  onClearCompleted: () => void;
}
