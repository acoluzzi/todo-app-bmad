export type TodoRecord = {
  id: string;
  description: string;
  is_completed: boolean;
  created_at: string;
};

export type Todo = {
  id: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
};

export type ApiErrorDetail = {
  path: string;
  message: string;
};
