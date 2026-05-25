import { useState, useRef, useCallback } from 'react'
import { format, eachDayOfInterval } from 'date-fns'
import { type DateRange } from 'react-day-picker'
import CalendarNav from '../components/timeline/CalendarNav'
import EntryCard from '../components/entries/EntryCard'
import EntryEditor from '../components/entries/EntryEditor'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { useDayEntries, useRangeEntries } from '../hooks/useTimeline'
import { Plus } from 'lucide-react'

const MIN_WIDTH = 220
const MAX_WIDTH = 480

// ── Single-day panel ───────────────────────────────────────────────────────────
function DayPanel({ date }: { date: Date }) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const { data: entries = [], isLoading } = useDayEntries(dateStr)
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </h1>
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-1.5 bg-brand-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-brand-600"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {showEditor && (
          <div className="mb-4">
            <EntryEditor
              defaultDate={dateStr}
              onSave={() => setShowEditor(false)}
              onCancel={() => setShowEditor(false)}
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : entries.length === 0 && !showEditor ? (
          <EmptyState icon="📅" title="Nothing on this day" />
        ) : (
          <div className="space-y-3">
            {entries.map(entry =>
              editingId === entry.id ? (
                <EntryEditor
                  key={entry.id}
                  entry={entry}
                  onSave={() => setEditingId(null)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <EntryCard key={entry.id} entry={entry} onEdit={() => setEditingId(entry.id)} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Range panel ────────────────────────────────────────────────────────────────
function RangePanel({ range }: { range: DateRange }) {
  const { from, to } = range
  const [editingId, setEditingId] = useState<string | null>(null)

  const startStr = from ? format(from, 'yyyy-MM-dd') : ''
  const endStr   = to   ? format(to,   'yyyy-MM-dd') : startStr

  const { data: groups = [], isLoading } = useRangeEntries(startStr, endStr)

  if (!from) return null

  const label = to && to !== from
    ? `${format(from, 'MMM d')} – ${format(to, 'MMM d, yyyy')}`
    : format(from, 'EEEE, MMMM d, yyyy')

  const totalEntries = groups.reduce((n, g) => n + g.entries.length, 0)

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">{label}</h1>
          {!isLoading && (
            <p className="text-sm text-gray-400 mt-0.5">
              {totalEntries === 0 ? 'No entries' : `${totalEntries} entr${totalEntries === 1 ? 'y' : 'ies'}`}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : groups.length === 0 ? (
          <EmptyState icon="📅" title="No entries in this range" />
        ) : (
          <div className="space-y-8">
            {groups.map(group => (
              <div key={group.date}>
                {/* Date divider */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {format(new Date(group.date + 'T00:00:00'), 'EEEE, MMM d')}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-300">{group.entries.length}</span>
                </div>
                <div className="space-y-3">
                  {group.entries.map(entry =>
                    editingId === entry.id ? (
                      <EntryEditor
                        key={entry.id}
                        entry={entry}
                        onSave={() => setEditingId(null)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <EntryCard key={entry.id} entry={entry} onEdit={() => setEditingId(entry.id)} />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function TimelinePage() {
  const [mode, setMode]                 = useState<'single' | 'range'>('single')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedRange, setSelectedRange] = useState<DateRange>({ from: new Date() })
  const [sidebarWidth, setSidebarWidth] = useState(288)
  const dragging = useRef(false)
  const startX   = useRef(0)
  const startW   = useRef(288)

  const handleModeChange = (m: 'single' | 'range') => {
    setMode(m)
    // seed range from current single selection
    if (m === 'range') setSelectedRange({ from: selectedDate })
    else if (selectedRange.from) setSelectedDate(selectedRange.from)
  }

  const handleSelect = (value: Date | DateRange) => {
    if (mode === 'single') setSelectedDate(value as Date)
    else setSelectedRange(value as DateRange)
  }

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    startX.current   = e.clientX
    startW.current   = sidebarWidth
    document.body.style.cursor     = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const delta = ev.clientX - startX.current
      setSidebarWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startW.current + delta)))
    }
    const onUp = () => {
      dragging.current = false
      document.body.style.cursor     = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [sidebarWidth])

  return (
    <div className="flex h-full">
      {/* Calendar sidebar */}
      <div
        className="shrink-0 bg-white overflow-y-auto p-4"
        style={{ width: sidebarWidth }}
      >
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Calendar</h2>
        <CalendarNav
          mode={mode}
          selected={mode === 'single' ? selectedDate : selectedRange}
          onSelect={handleSelect}
          onModeChange={handleModeChange}
        />
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={onMouseDown}
        className="w-1 shrink-0 bg-gray-200 hover:bg-brand-400 active:bg-brand-500 cursor-col-resize transition-colors"
      />

      {/* Content */}
      {mode === 'single'
        ? <DayPanel date={selectedDate} />
        : <RangePanel range={selectedRange} />
      }
    </div>
  )
}
