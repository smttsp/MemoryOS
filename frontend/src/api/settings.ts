import { api } from './client'

export const getSettings = () =>
  api.get<Record<string, string>>('/settings').then(r => r.data)

export const updateSettings = (data: Record<string, string>) =>
  api.patch('/settings', data).then(r => r.data)
