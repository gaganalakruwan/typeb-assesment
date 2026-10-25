export interface Todo {
  _id: string
  title: string
  description?: string
  dueDate?: string
  done: boolean
  createdAt: string
  updatedAt: string
}

export type CreateTodoInput = Pick<Todo, 'title' | 'description' | 'dueDate'>
export type UpdateTodoInput = Partial<CreateTodoInput>
