import { api } from './client'
import type { SearchResult } from '../types'

export const semanticSearch = (query: string, opts?: {
  collection_ids?: string[]; date_from?: string; date_to?: string; top_k?: number
}) => api.post<SearchResult[]>('/search', { query, ...opts }).then(r => r.data)
