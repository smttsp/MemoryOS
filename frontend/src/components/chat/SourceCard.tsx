import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import type { SearchResult } from '../../types'

export default function SourceCard({ source }: { source: SearchResult }) {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(`/e/${source.entry_id}`)}
      className="text-left border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors max-w-[200px]">
      <div className="text-[10px] text-brand-600 font-medium mb-0.5">
        {format(new Date(source.entry_date + 'T00:00:00'), 'MMM d, yyyy')}
      </div>
      <div className="text-xs text-gray-600 line-clamp-2">
        {source.title || source.chunk_text}
      </div>
    </button>
  )
}
