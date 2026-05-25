import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2 } from 'lucide-react'
import { format } from 'date-fns'
import { useEntry } from '../hooks/useEntries'
import { useCollections } from '../hooks/useCollections'
import EntryEditor from '../components/entries/EntryEditor'
import AttachmentGrid from '../components/attachments/AttachmentGrid'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

export default function EntryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: entry, isLoading } = useEntry(id!)
  const { data: collections = [] } = useCollections()
  const [editing, setEditing] = useState(false)

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!entry) return <div className="p-8 text-gray-400">Entry not found</div>

  const collection = collections.find(c => c.id === entry.collection_id)

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={14} /> Back
        </button>
        <EntryEditor entry={entry} onSave={() => setEditing(false)} onCancel={() => setEditing(false)} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex-1" />
        <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">
          <Edit2 size={13} /> Edit
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          {collection && <span>{collection.icon}</span>}
          <span className="text-sm text-gray-400">{collection?.name}</span>
          <span className="text-gray-200">·</span>
          <span className="text-sm text-gray-400">{format(new Date(entry.entry_date + 'T00:00:00'), 'MMMM d, yyyy')}</span>
        </div>

        {entry.title && <h1 className="text-xl font-bold text-gray-900 mb-3">{entry.title}</h1>}

        <div className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: entry.body }} />

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {entry.tags.map(t => <Badge key={t} label={t} />)}
          </div>
        )}

        {entry.attachments.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Attachments ({entry.attachments.length})</h3>
            <AttachmentGrid attachments={entry.attachments} />
          </div>
        )}
      </div>
    </div>
  )
}
