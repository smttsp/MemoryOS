import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as collectionsApi from '../api/collections'
import toast from 'react-hot-toast'

export const useCollections = () =>
  useQuery({
    queryKey: ['collections'],
    queryFn: collectionsApi.getCollections,
  })

export const useCreateCollection = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: collectionsApi.createCollection,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['collections'] }); toast.success('Collection created') },
    onError: () => toast.error('Failed to create collection'),
  })
}

export const useUpdateCollection = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => collectionsApi.updateCollection(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] }),
    onError: () => toast.error('Failed to update collection'),
  })
}

export const useDeleteCollection = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: collectionsApi.deleteCollection,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['collections'] }); toast.success('Collection deleted') },
    onError: () => toast.error('Failed to delete collection'),
  })
}
