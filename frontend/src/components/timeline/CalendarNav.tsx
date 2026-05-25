import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { useMonthSummary } from '../../hooks/useTimeline'
import { useState } from 'react'

interface Props {
  selected: Date
  onSelect: (date: Date) => void
}

export default function CalendarNav({ selected, onSelect }: Props) {
  const [viewMonth, setViewMonth] = useState(new Date())
  const { data: summary = [] } = useMonthSummary(viewMonth.getFullYear(), viewMonth.getMonth() + 1)

  const daysWithEntries = new Set(summary.map(s => s.date))

  const modifiers = {
    hasEntry: (date: Date) => {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      return daysWithEntries.has(key)
    }
  }

  const modifiersStyles = {
    hasEntry: { fontWeight: '700', textDecoration: 'underline', textDecorationColor: '#6c63ff' }
  }

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={d => d && onSelect(d)}
      month={viewMonth}
      onMonthChange={setViewMonth}
      modifiers={modifiers}
      modifiersStyles={modifiersStyles}
      className="text-sm"
    />
  )
}
