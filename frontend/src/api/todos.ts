import { api } from './client'
import type { Todo } from '../types'

export const getTodos = (params: {
  status?: string
  tag?: string
  priority?: string
}) => api.get<Todo[]>('/todos', { params }).then(r => r.data)

export const createTodo = (data: {
  title: string
  notes?: string
  tags?: string[]
  priority?: string
  start_date?: string
  deadline?: string
}) => api.post<Todo>('/todos', data).then(r => r.data)

export const updateTodo = (id: string, data: Partial<{
  title: string
  notes: string
  tags: string[]
  status: string
  priority: string
  start_date: string
  deadline: string
}>) => api.patch<Todo>(`/todos/${id}`, data).then(r => r.data)

export const deleteTodo = (id: string) =>
  api.delete(`/todos/${id}`)
