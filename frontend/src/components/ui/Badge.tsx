export default function Badge({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs px-2 py-0.5 rounded-full border border-brand-200">
      #{label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-brand-900 leading-none">&times;</button>
      )}
    </span>
  )
}
