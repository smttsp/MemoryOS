import { useState, KeyboardEvent } from 'react'
import Badge from '../ui/Badge'

interface Props { tags: string[]; onChange: (tags: string[]) => void }

export default function TagInput({ tags, onChange }: Props) {
  const [input, setInput] = useState('')

  const add = () => {
    const t = input.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t)) onChange([...tags, t])
    setInput('')
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && tags.length) onChange(tags.slice(0, -1))
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center border border-gray-200 rounded-lg px-2 py-1.5 min-h-[36px] focus-within:ring-2 focus-within:ring-brand-500">
      {tags.map(t => <Badge key={t} label={t} onRemove={() => onChange(tags.filter(x => x !== t))} />)}
      <input
        value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} onBlur={add}
        placeholder={tags.length ? '' : 'Add tags…'}
        className="flex-1 min-w-[80px] text-xs outline-none bg-transparent text-gray-700 placeholder-gray-400"
      />
    </div>
  )
}
