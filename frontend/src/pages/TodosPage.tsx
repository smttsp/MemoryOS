import { useState, useMemo } from 'react'
import { format, isPast, isToday } from 'date-fns'
import { Plus, Trash2, ChevronDown, ChevronUp, Calendar, Tag, Flag } from 'lucide-react'
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '../hooks/useTodos'
import TagInput from '../components/entries/TagInput'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import type { Todo } from '../types'

// ── Priority config ────────────────────────────────────────────────────────────
const PRIORITY = {
  high:   { label: 'High',   color: 'text-red-500',    bg: 'bg-red-50 border-red-200'   },
  medium: { label: 'Medium', color: 'text-amber-500',  bg: 'bg-amber-50 border-amber-200' },
  low:    { label: 'Low',    color: 'text-gray-400',   bg: 'bg-gray-50 border-gray-200'  },
}

// ── Add Todo form ──────────────────────────────────────────────────────────────
function AddTodoForm({ onClose }: { onClose: () => void }) {
  const create = useCreateTodo()
  const [title, setTitle]           = useState('')
  const [notes, setNotes]           = useState('')
  const [tags, setTags]             = useState<string[]>([])
  const [priority, setPriority]     = useState<'low' | 'medium' | 'high'>('medium')
  const [startDate, setStartDate]   = useState(format(new Date(), 'yyyy-MM-dd'))
  const [deadline, setDeadline]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await create.mutateAsync({
      title: title.trim(),
      notes: notes.trim() || undefined,
      tags,
      priority,
      start_date: startDate || undefined,
      deadline: deadline || undefined,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-brand-200 rounded-xl p-4 shadow-sm space-y-3 mb-4">
      {/* Title */}
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="w-full text-sm font-medium border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400 text-gray-900"
      />

      {/* Notes */}
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400"
      />

      {/* Row: priority + dates */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Priority */}
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as any)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>

        {/* Start date */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">Start</span>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">Due</span>
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Tags */}
      <TagInput tags={tags} onChange={setTags} />

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={create.isPending || !title.trim()}
          className="px-4 py-1.5 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
        >
          {create.isPending ? 'Adding…' : 'Add Todo'}
        </button>
      </div>
    </form>
  )
}

// ── Single todo row ────────────────────────────────────────────────────────────
function TodoRow({ todo }: { todo: Todo }) {
  const update  = useUpdateTodo()
  const remove  = useDeleteTodo()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing]   = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)

  const isDone     = todo.status === 'done'
  const p          = PRIORITY[todo.priority]
  const isOverdue  = todo.deadline && !isDone && isPast(new Date(todo.deadline + 'T23:59:59'))
  const isDueToday = todo.deadline && !isDone && isToday(new Date(todo.deadline + 'T00:00:00'))

  const toggle = () =>
    update.mutate({ id: todo.id, data: { status: isDone ? 'pending' : 'done' } })

  const saveTitle = () => {
    if (editTitle.trim() && editTitle !== todo.title)
      update.mutate({ id: todo.id, data: { title: editTitle.trim() } })
    setEditing(false)
  }

  return (
    <div className={`group rounded-xl border transition-colors ${isDone ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'}`}>
      {/* Main row */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Checkbox */}
        <button
          onClick={toggle}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            isDone ? 'bg-brand-500 border-brand-500' : 'border-gray-300 hover:border-brand-400'
          }`}
        >
          {isDone && <span className="text-white text-xs leading-none">✓</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditing(false) }}
              className="w-full text-sm font-medium outline-none border-b border-brand-400 bg-transparent pb-0.5"
            />
          ) : (
            <span
              onDoubleClick={() => setEditing(true)}
              className={`text-sm font-medium cursor-text select-none ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}
            >
              {todo.title}
            </span>
          )}

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {/* Priority */}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${p.bg} ${p.color}`}>
              {p.label}
            </span>

            {/* Start date */}
            {todo.start_date && (
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                <Calendar size={10} /> {format(new Date(todo.start_date + 'T00:00:00'), 'MMM d')}
              </span>
            )}

            {/* Deadline */}
            {todo.deadline && (
              <span className={`flex items-center gap-0.5 text-[10px] font-medium ${
                isOverdue ? 'text-red-500' : isDueToday ? 'text-amber-500' : 'text-gray-400'
              }`}>
                <Flag size={10} />
                {isOverdue ? 'Overdue · ' : isDueToday ? 'Due today · ' : ''}
                {format(new Date(todo.deadline + 'T00:00:00'), 'MMM d')}
              </span>
            )}

            {/* Created */}
            <span className="text-[10px] text-gray-300">
              {format(new Date(todo.created_at), 'MMM d, yyyy')}
            </span>
          </div>

          {/* Tags row */}
          {todo.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {todo.tags.map(t => <Badge key={t} label={t} />)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            onClick={() => remove.mutate(todo.id)}
            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-12 pb-4 space-y-2 border-t border-gray-100 pt-3">
          {todo.notes && <p className="text-sm text-gray-600 leading-relaxed">{todo.notes}</p>}
          {todo.completed_at && (
            <p className="text-xs text-gray-400">
              Completed {format(new Date(todo.completed_at), 'MMM d, yyyy · h:mm a')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function TodosPage() {
  const [showAll, setShowAll]       = useState(false)
  const [showForm, setShowForm]     = useState(false)
  const [activeTag, setActiveTag]   = useState<string | null>(null)
  const [activePriority, setActivePriority] = useState<string | null>(null)

  const { data: todos = [], isLoading } = useTodos({
    status: showAll ? undefined : 'pending',
    tag: activeTag ?? undefined,
    priority: activePriority ?? undefined,
  })

  // Collect all unique tags across todos for the filter bar
  const allTags = useMemo(() => {
    const { data: allTodosRaw } = { data: todos }
    return [...new Set(todos.flatMap(t => t.tags))].sort()
  }, [todos])

  const pending = todos.filter(t => t.status === 'pending').length
  const done    = todos.filter(t => t.status === 'done').length

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Todos</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {pending} remaining{showAll && done > 0 ? ` · ${done} done` : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus size={15} /> New Todo
        </button>
      </div>

      {/* Add form */}
      {showForm && <AddTodoForm onClose={() => setShowForm(false)} />}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Show all toggle */}
        <button
          onClick={() => setShowAll(v => !v)}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
            showAll
              ? 'bg-gray-800 text-white border-gray-800'
              : 'border-gray-200 text-gray-500 hover:border-gray-400'
          }`}
        >
          {showAll ? 'Showing all' : 'Remaining only'}
        </button>

        {/* Priority filters */}
        {(['high', 'medium', 'low'] as const).map(p => (
          <button
            key={p}
            onClick={() => setActivePriority(activePriority === p ? null : p)}
            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
              activePriority === p
                ? `${PRIORITY[p].bg} ${PRIORITY[p].color} border-current`
                : 'border-gray-200 text-gray-400 hover:border-gray-300'
            }`}
          >
            {PRIORITY[p].label}
          </button>
        ))}

        {/* Tag filters */}
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              activeTag === tag
                ? 'bg-brand-500 text-white border-brand-500'
                : 'border-gray-200 text-gray-400 hover:border-brand-300'
            }`}
          >
            #{tag}
          </button>
        ))}

        {/* Clear filters */}
        {(activeTag || activePriority) && (
          <button
            onClick={() => { setActiveTag(null); setActivePriority(null) }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            × clear filters
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : todos.length === 0 ? (
        <EmptyState
          icon="✅"
          title={showAll ? 'No todos yet' : 'All done!'}
          description={showAll ? 'Add your first todo above' : 'Nothing remaining — great work'}
          action={
            !showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-600"
              >
                Add todo
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {todos.map(todo => <TodoRow key={todo.id} todo={todo} />)}
        </div>
      )}
    </div>
  )
}
