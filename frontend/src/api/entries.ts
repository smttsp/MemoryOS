import { api } from './client'
import type { Entry } from '../types'

export const getEntries = (params: {
  collection_id?: string; date?: string; tag?: string; limit?: number; offset?: number
}) => api.get<Entry[]>('/entries', { params }).then(r => r.data)

export const getEntry = (id: string) =>
  api.get<Entry>(`/entries/${id}`).then(r => r.data)

export const createEntry = (data: {
  collection_id: string; title?: string; body: string; tags: string[]; entry_date: string
}) => api.post<Entry>('/entries', data).then(r => r.data)

export const updateEntry = (id: string, data: Partial<{
  collection_id: string; title: string; body: string; tags: string[]; entry_date: string
}>) => api.patch<Entry>(`/entries/${id}`, data).then(r => r.data)

export const deleteEntry = (id: string) =>
  api.delete(`/entries/${id}`)
