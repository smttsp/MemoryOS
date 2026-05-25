import { useState } from 'react'
import { X } from 'lucide-react'
import { useCreateCollection, useUpdateCollection } from '../../hooks/useCollections'
import type { Collection } from '../../types'
import Modal from '../ui/Modal'

const PRESETS = ['📁','💡','💰','🏢','🏠','📈','❤️','🎨','📚','🎯','🔬','✈️','🍔','🎵','⚽','💻','🌿','🔑']
const COLORS  = ['#6c63ff','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#84cc16']

interface Props { onClose: () => void; collection?: Collection }

export default function CollectionModal({ onClose, collection }: Props) {
  const [name, setName]         = useState(collection?.name ?? '')
  const [icon, setIcon]         = useState(collection?.icon ?? '📁')
  const [color, setColor]       = useState(collection?.color ?? '#6c63ff')
  const [description, setDesc]  = useState(collection?.description ?? '')

  const create = useCreateCollection()
  const update = useUpdateCollection()
  const busy   = create.isPending || update.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (collection) {
      await update.mutateAsync({ id: collection.id, data: { name, icon, color, description } })
    } else {
      await create.mutateAsync({ name, icon, color, description })
    }
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4 w-80">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{collection ? 'Edit' : 'New'} Collection</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Inspiration"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Icon</label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(e => (
              <button key={e} type="button" onClick={() => setIcon(e)}
                className={`w-8 h-8 rounded-md text-lg flex items-center justify-center transition-colors ${icon === e ? 'bg-brand-100 ring-2 ring-brand-500' : 'hover:bg-gray-100'}`}>
                {e}
              </button>
            ))}
          </div>
          <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="or type any emoji"
            className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`} />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description <span className="text-gray-400">(optional, helps AI understand it)</span></label>
          <textarea value={description} onChange={e => setDesc(e.target.value)} rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
        </div>

        <button type="submit" disabled={busy || !name.trim()}
          className="w-full bg-brand-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors">
          {busy ? 'Saving…' : collection ? 'Save Changes' : 'Create Collection'}
        </button>
      </form>
    </Modal>
  )
}
