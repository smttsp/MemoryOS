import { useState } from 'react'
import { format } from 'date-fns'
import CalendarNav from '../components/timeline/CalendarNav'
import EntryCard from '../components/entries/EntryCard'
import EntryEditor from '../components/entries/EntryEditor'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { useDayEntries } from '../hooks/useTimeline'
import { Plus } from 'lucide-react'

export default function TimelinePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showEditor, setShowEditor]     = useState(false)
  const [editingId, setEditingId]       = useState<string | null>(null)
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const { data: entries = [], isLoading } = useDayEntries(dateStr)

  return (
    <div className="flex h-full">
      {/* Calendar sidebar */}
      <div className="w-64 shrink-0 border-r border-gray-200 bg-white p-4 overflow-y-auto">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Calendar</h2>
        <CalendarNav selected={selectedDate} onSelect={setSelectedDate} />
      </div>

      {/* Day content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h1>
          <button onClick={() => setShowEditor(true)}
            className="flex items-center gap-1.5 bg-brand-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-brand-600">
            <Plus size={14} /> Add
          </button>
        </div>

        {showEditor && (
          <div className="mb-4">
            <EntryEditor defaultDate={dateStr}
              onSave={() => setShowEditor(false)} onCancel={() => setShowEditor(false)} />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : entries.length === 0 && !showEditor ? (
          <EmptyState icon="📅" title="Nothing on this day" />
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
    </div>
  )
}
