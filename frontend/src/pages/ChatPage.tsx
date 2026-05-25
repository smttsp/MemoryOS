import { useState, useRef, useEffect } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getChatHistory, clearChatHistory } from '../api/chat'
import { useCollections } from '../hooks/useCollections'
import ChatMessageComponent from '../components/chat/ChatMessage'
import Spinner from '../components/ui/Spinner'
import type { ChatMessage, SearchResult } from '../types'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const [input, setInput]               = useState('')
  const [streaming, setStreaming]       = useState(false)
  const [streamingMsg, setStreamingMsg] = useState('')
  const [filterCollections, setFilterCollections] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data: collections = [] } = useCollections()
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['chat-history'],
    queryFn: getChatHistory,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, streamingMsg])

  const send = async () => {
    if (!input.trim() || streaming) return
    const message = input.trim()
    setInput('')
    setStreaming(true)
    setStreamingMsg('')

    // Optimistically add user message
    const tempUser: ChatMessage = {
      id: 'temp-user', role: 'user', content: message, created_at: new Date().toISOString()
    }
    qc.setQueryData(['chat-history'], (old: ChatMessage[] = []) => [...old, tempUser])

    let accum = ''
    let sources: SearchResult[] = []

    try {
      const resp = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          collection_ids: filterCollections.length ? filterCollections : undefined,
        }),
      })

      if (!resp.ok) throw new Error('Request failed')
      if (!resp.body) throw new Error('No body')

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        for (const line of text.split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.token) { accum += data.token; setStreamingMsg(accum) }
            if (data.sources) sources = data.sources
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (e) {
      toast.error('Chat request failed')
    } finally {
      setStreaming(false)
      setStreamingMsg('')
      // Refresh history from server to get persisted messages with correct IDs
      qc.invalidateQueries({ queryKey: ['chat-history'] })
    }
  }

  const handleClear = async () => {
    await clearChatHistory()
    qc.invalidateQueries({ queryKey: ['chat-history'] })
    toast.success('History cleared')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div>
          <h1 className="font-bold text-gray-900">AI Chat</h1>
          <p className="text-xs text-gray-400">Ask anything about your saved memories</p>
        </div>
        <button onClick={handleClear} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50">
          <Trash2 size={12} /> Clear history
        </button>
      </div>

      {/* Collection filter */}
      {collections.length > 0 && (
        <div className="px-6 py-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">Search in:</span>
          {collections.map(c => (
            <button key={c.id} onClick={() => setFilterCollections(prev =>
              prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]
            )}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                filterCollections.includes(c.id)
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-gray-200 text-gray-500 hover:border-brand-300'
              }`}>
              {c.icon} {c.name}
            </button>
          ))}
          {filterCollections.length > 0 && (
            <button onClick={() => setFilterCollections([])} className="text-xs text-gray-400 hover:text-gray-600">× clear</button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : history.length === 0 && !streaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-500 font-medium">Ask about your memories</p>
            <p className="text-gray-400 text-sm mt-1">Try: "What did I save about design last month?"</p>
          </div>
        ) : (
          <>
            {history.map(msg => <ChatMessageComponent key={msg.id} message={msg} />)}
            {streaming && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 max-w-[80%] whitespace-pre-wrap">
                  {streamingMsg || <span className="flex items-center gap-1 text-gray-400"><Spinner size={12} /> Thinking…</span>}
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 max-h-32"
            style={{ minHeight: '42px' }}
          />
          <button onClick={send} disabled={streaming || !input.trim()}
            className="p-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors shrink-0">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
