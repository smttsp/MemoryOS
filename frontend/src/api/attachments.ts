import { api } from './client'
import type { Attachment } from '../types'

export const uploadAttachment = (entryId: string, file: File, userNote = '') => {
  const form = new FormData()
  form.append('entry_id', entryId)
  form.append('file', file)
  form.append('user_note', userNote)
  return api.post<Attachment>('/attachments/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const updateAttachmentNote = (id: string, user_note: string) =>
  api.patch<Attachment>(`/attachments/${id}`, { user_note }).then(r => r.data)

export const getAttachmentStatus = (id: string) =>
  api.get<{ id: string; embed_status: string; ai_caption?: string }>(`/attachments/${id}/status`).then(r => r.data)

export const deleteAttachment = (id: string) =>
  api.delete(`/attachments/${id}`)
