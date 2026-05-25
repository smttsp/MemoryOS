import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Edit2, Paperclip } from 'lucide-react'
import { format } from 'date-fns'
import { useDeleteEntry } from '../../hooks/useEntries'
import { useCollections } from '../../hooks/useCollections'
import Badge from '../ui/Badge'
import { fileUrl } from '../../api/client'
import type { Entry } from '../../types'

export default function EntryCard({ entry, onEdit }: { entry: Entry; onEdit?: () => void }) {
  const navigate    = useNavigate()
  const deleteEntry = useDeleteEntry()
  const { data: collections = [] } = useCollections()
  const [confirmDel, setConfirmDel] = useState(false)

  const collection = collections.find(c => c.id === entry.collection_id)
  const images     = entry.attachments.filter(a => a.file_type === 'image')
  const others     = entry.attachments.filter(a => a.file_type !== 'image')

  const handleDelete = async () => {
    await deleteEntry.mutateAsync(entry.id)
    setConfirmDel(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {collection && (
            <span className="text-base shrink-0">{collection.icon}</span>
          )}
          <div className="min-w-0">
            {entry.title && <h3 className="font-semibold text-gray-900 text-sm truncate">{entry.title}</h3>}
            <span className="text-xs text-gray-400">{format(new Date(entry.entry_date + 'T00:00:00'), 'MMM d, yyyy')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onEdit && (
            <button onClick={onEdit} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
              <Edit2 size={13} />
            </button>
          )}
          <button onClick={() => setConfirmDel(true)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Body preview */}
      {entry.body_plain && (
        <p className="text-sm text-gray-600 line-clamp-3 mb-2 cursor-pointer" onClick={() => navigate(`/e/${entry.id}`)}>
          {entry.body_plain}
        </p>
      )}

      {/* Image thumbnails */}
      {images.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-2">
          {images.slice(0, 4).map(a => (
            <img key={a.id}
              src={fileUrl(a.thumbnail_path || a.storage_path)}
              alt={a.filename}
              className="w-16 h-16 object-cover rounded-lg border border-gray-100 cursor-pointer"
              onClick={() => navigate(`/e/${entry.id}`)}
            />
          ))}
          {images.length > 4 && (
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 cursor-pointer"
              onClick={() => navigate(`/e/${entry.id}`)}>
              +{images.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Other attachments */}
      {others.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
          <Paperclip size={11} /> {others.length} file{others.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.map(t => <Badge key={t} label={t} />)}
        </div>
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-red-600">Delete this entry?</span>
          <button onClick={handleDelete} className="px-2 py-0.5 bg-red-500 text-white rounded text-xs">Yes</button>
          <button onClick={() => setConfirmDel(false)} className="px-2 py-0.5 bg-gray-100 rounded text-xs">No</button>
        </div>
      )}
    </div>
  )
}
