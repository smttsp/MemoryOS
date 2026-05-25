import { api } from './client'
import type { ChatMessage } from '../types'

export const getChatHistory = () =>
  api.get<ChatMessage[]>('/chat/history').then(r => r.data)

export const clearChatHistory = () =>
  api.delete('/chat/history')
