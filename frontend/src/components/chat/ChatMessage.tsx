import { format } from 'date-fns'
import type { ChatMessage as ChatMsg } from '../../types'
import SourceCard from './SourceCard'

export default function ChatMessage({ message }: { message: ChatMsg }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-800'
        }`}>
          {message.content}
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.sources.map(s => <SourceCard key={s.entry_id} source={s} />)}
          </div>
        )}
        <span className="text-[10px] text-gray-400 px-1">
          {format(new Date(message.created_at), 'h:mm a')}
        </span>
      </div>
    </div>
  )
}
