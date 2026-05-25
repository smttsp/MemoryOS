import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as todosApi from '../api/todos'
import toast from 'react-hot-toast'

export const useTodos = (params: { status?: string; tag?: string; priority?: string }) =>
  useQuery({
    queryKey: ['todos', params],
    queryFn: () => todosApi.getTodos(params),
  })

export const useCreateTodo = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: todosApi.createTodo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
    onError: () => toast.error('Failed to create todo'),
  })
}

export const useUpdateTodo = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof todosApi.updateTodo>[1] }) =>
      todosApi.updateTodo(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
    onError: () => toast.error('Failed to update todo'),
  })
}

export const useDeleteTodo = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: todosApi.deleteTodo,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['todos'] }); toast.success('Deleted') },
    onError: () => toast.error('Failed to delete todo'),
  })
}
