import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as entriesApi from '../api/entries'
import toast from 'react-hot-toast'

export const useEntries = (params: { collection_id?: string; date?: string; tag?: string; limit?: number }) =>
  useQuery({
    queryKey: ['entries', params],
    queryFn: () => entriesApi.getEntries(params),
  })

export const useEntry = (id: string) =>
  useQuery({
    queryKey: ['entry', id],
    queryFn: () => entriesApi.getEntry(id),
    enabled: !!id,
  })

export const useCreateEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: entriesApi.createEntry,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['entries'] }); qc.invalidateQueries({ queryKey: ['collections'] }) },
    onError: () => toast.error('Failed to create entry'),
  })
}

export const useUpdateEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => entriesApi.updateEntry(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['entries'] })
      qc.invalidateQueries({ queryKey: ['entry', vars.id] })
    },
    onError: () => toast.error('Failed to save entry'),
  })
}

export const useDeleteEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: entriesApi.deleteEntry,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['entries'] }); qc.invalidateQueries({ queryKey: ['collections'] }); toast.success('Entry deleted') },
    onError: () => toast.error('Failed to delete entry'),
  })
}
