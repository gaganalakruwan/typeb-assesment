import type { CreateTodoInput, Todo, UpdateTodoInput } from '../types/todo'
import { apiClient } from './client'

export const getTodos = async () => (await apiClient.get<Todo[]>('/todos')).data

export const createTodo = async (input: CreateTodoInput) =>
  (await apiClient.post<Todo>('/todos', input)).data

export const updateTodo = async (id: string, input: UpdateTodoInput) =>
  (await apiClient.put<Todo>(`/todos/${id}`, input)).data

export const toggleTodo = async (id: string) =>
  (await apiClient.patch<Todo>(`/todos/${id}/done`)).data

export const deleteTodo = async (id: string) => {
  await apiClient.delete(`/todos/${id}`)
}
