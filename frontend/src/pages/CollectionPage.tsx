import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Settings, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useCollections, useDeleteCollection } from '../hooks/useCollections'
import { useEntries } from '../hooks/useEntries'
import EntryCard from '../components/entries/EntryCard'
import EntryEditor from '../components/entries/EntryEditor'
import CollectionModal from '../components/collections/CollectionModal'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'

export default function CollectionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: collections = [] } = useCollections()
  const collection = collections.find(c => c.id === id)
  const { data: entries = [], isLoading } = useEntries({ collection_id: id, limit: 100 })
  const deleteCollection = useDeleteCollection()

  const [showEditor, setShowEditor]  = useState(false)
  const [editingId, setEditingId]    = useState<string | null>(null)
  const [showEdit, setShowEdit]      = useState(false)
  const [confirmDel, setConfirmDel]  = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')

  if (!collection) return <div className="p-8 text-gray-400">Collection not found</div>

  const handleDeleteCollection = async () => {
    await deleteCollection.mutateAsync(id!)
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{collection.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{collection.name}</h1>
            {collection.description && <p className="text-sm text-gray-400 mt-0.5">{collection.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEditor(true)}
            className="flex items-center gap-1.5 bg-brand-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-brand-600">
            <Plus size={14} /> Add
          </button>
          <button onClick={() => setShowEdit(true)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <Settings size={16} />
          </button>
          <button onClick={() => setConfirmDel(true)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {confirmDel && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-sm">
          <span className="text-red-700">Delete "{collection.name}" and all its entries?</span>
          <button onClick={handleDeleteCollection} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Delete</button>
          <button onClick={() => setConfirmDel(false)} className="px-2 py-1 bg-gray-100 rounded text-xs">Cancel</button>
        </div>
      )}

      {showEditor && (
        <div className="mb-6">
          <EntryEditor defaultCollectionId={id} defaultDate={today}
            onSave={() => setShowEditor(false)} onCancel={() => setShowEditor(false)} />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : entries.length === 0 && !showEditor ? (
        <EmptyState icon={collection.icon} title="No entries yet"
          description={`Start adding to ${collection.name}`}
          action={
            <button onClick={() => setShowEditor(true)}
              className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-600">
              Add first entry
            </button>
          } />
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            editingId === entry.id ? (
              <EntryEditor key={entry.id} entry={entry}
                onSave={() => setEditingId(null)} onCancel={() => setEditingId(null)} />
            ) : (
              <EntryCard key={entry.id} entry={entry} onEdit={() => setEditingId(entry.id)} />
            )
          ))}
        </div>
      )}

      {showEdit && collection && (
        <CollectionModal collection={collection} onClose={() => setShowEdit(false)} />
      )}
    </div>
  )
}
