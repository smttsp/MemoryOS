export interface Collection {
  id: string
  name: string
  icon: string
  color: string
  description?: string
  sort_order: number
  created_at: string
  updated_at: string
  entry_count: number
}

export interface Attachment {
  id: string
  entry_id: string
  filename: string
  mime_type: string
  file_type: 'image' | 'video' | 'pdf' | 'file'
  storage_path: string
  thumbnail_path?: string
  file_size: number
  ai_caption?: string
  ocr_text?: string
  user_note?: string
  embed_status: 'pending' | 'processing' | 'done' | 'skipped'
  created_at: string
}

export interface Entry {
  id: string
  collection_id: string
  title?: string
  body: string
  body_plain: string
  tags: string[]
  entry_date: string
  created_at: string
  updated_at: string
  attachments: Attachment[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: SearchResult[]
  created_at: string
}

export interface SearchResult {
  entry_id: string
  title?: string
  body_plain: string
  entry_date: string
  collection_id: string
  score: number
  chunk_text: string
  attachments: Partial<Attachment>[]
}

export interface TimelineDaySummary {
  date: string
  entry_count: number
}
