import { api } from './client'
import type { Collection } from '../types'

export const getCollections = () =>
  api.get<Collection[]>('/collections').then(r => r.data)

export const createCollection = (data: {
  name: string; icon: string; color: string; description?: string
}) => api.post<Collection>('/collections', data).then(r => r.data)

export const updateCollection = (id: string, data: Partial<Collection>) =>
  api.patch<Collection>(`/collections/${id}`, data).then(r => r.data)

export const deleteCollection = (id: string) =>
  api.delete(`/collections/${id}`)
