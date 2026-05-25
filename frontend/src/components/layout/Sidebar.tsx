import { NavLink, useNavigate } from 'react-router-dom'
import { CalendarDays, MessageSquare, Home, Settings, Plus, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react'
import { useCollections } from '../../hooks/useCollections'
import { useState } from 'react'
import CollectionModal from '../collections/CollectionModal'

interface Props { open: boolean; onToggle: () => void }

export default function Sidebar({ open, onToggle }: Props) {
  const { data: collections = [] } = useCollections()
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <>
      <div className={`${open ? 'w-60' : 'w-14'} flex flex-col bg-white border-r border-gray-200 transition-all duration-200 shrink-0`}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-gray-100">
          {open && <span className="font-bold text-gray-900 text-base">🧠 MemoryOS</span>}
          <button onClick={onToggle} className="p-1 rounded hover:bg-gray-100 text-gray-400">
            {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Main nav */}
          <NavLink to="/" className={navCls} end>
            <Home size={16} /> {open && 'Today'}
          </NavLink>
          <NavLink to="/timeline" className={navCls}>
            <CalendarDays size={16} /> {open && 'Timeline'}
          </NavLink>
          <NavLink to="/chat" className={navCls}>
            <MessageSquare size={16} /> {open && 'AI Chat'}
          </NavLink>
          <NavLink to="/todos" className={navCls}>
            <CheckSquare size={16} /> {open && 'Todos'}
          </NavLink>

          {/* Collections */}
          {open && (
            <div className="pt-3">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Collections</span>
                <button onClick={() => setShowModal(true)} className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                  <Plus size={14} />
                </button>
              </div>
              {collections.map(c => (
                <NavLink key={c.id} to={`/c/${c.id}`} className={navCls}>
                  <span className="text-base leading-none">{c.icon}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-gray-400">{c.entry_count}</span>
                </NavLink>
              ))}
              {collections.length === 0 && (
                <button onClick={() => setShowModal(true)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                  + Create first collection
                </button>
              )}
            </div>
          )}
        </nav>

        <div className="p-2 border-t border-gray-100">
          <NavLink to="/settings" className={navCls}>
            <Settings size={16} /> {open && 'Settings'}
          </NavLink>
        </div>
      </div>

      {showModal && <CollectionModal onClose={() => setShowModal(false)} />}
    </>
  )
}
