import { useState } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { useEntries } from '../hooks/useEntries'
import EntryCard from '../components/entries/EntryCard'
import EntryEditor from '../components/entries/EntryEditor'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'

const today = format(new Date(), 'yyyy-MM-dd')

export default function Today() {
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const { data: entries = [], isLoading } = useEntries({ date: today })

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today</h1>
          <p className="text-sm text-gray-400 mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <button onClick={() => { setShowEditor(true); setEditingId(null) }}
          className="flex items-center gap-1.5 bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
          <Plus size={15} /> New Entry
        </button>
      </div>

      {showEditor && (
        <div className="mb-6">
          <EntryEditor
            defaultDate={today}
            onSave={() => setShowEditor(false)}
            onCancel={() => setShowEditor(false)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : entries.length === 0 && !showEditor ? (
        <EmptyState icon="✍️" title="Nothing here yet" description="Start capturing your day"
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
    </div>
  )
}
