import { DayPicker, type DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { useMonthSummary } from '../../hooks/useTimeline'
import { useState } from 'react'

interface Props {
  selected: Date | DateRange
  onSelect: (value: Date | DateRange) => void
  mode: 'single' | 'range'
  onModeChange: (mode: 'single' | 'range') => void
}

export default function CalendarNav({ selected, onSelect, mode, onModeChange }: Props) {
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
    <div>
      {/* Mode toggle */}
      <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-0.5">
        {(['single', 'range'] as const).map(m => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`flex-1 text-xs py-1 rounded-md font-medium transition-colors ${
              mode === m
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {m === 'single' ? 'Day' : 'Range'}
          </button>
        ))}
      </div>

      {mode === 'single' ? (
        <DayPicker
          mode="single"
          selected={selected as Date}
          onSelect={d => d && onSelect(d)}
          month={viewMonth}
          onMonthChange={setViewMonth}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="text-sm !w-full"
          style={{ '--rdp-cell-size': '34px' } as React.CSSProperties}
        />
      ) : (
        <DayPicker
          mode="range"
          selected={selected as DateRange}
          onSelect={r => r && onSelect(r)}
          month={viewMonth}
          onMonthChange={setViewMonth}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="text-sm !w-full"
          style={{ '--rdp-cell-size': '34px' } as React.CSSProperties}
        />
      )}
    </div>
  )
}
