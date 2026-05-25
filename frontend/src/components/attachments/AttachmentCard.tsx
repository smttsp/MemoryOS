import { useState, useEffect } from 'react'
import { File, Film, FileText, X } from 'lucide-react'
import { fileUrl } from '../../api/client'
import { getAttachmentStatus, deleteAttachment } from '../../api/attachments'
import type { Attachment } from '../../types'

interface Props {
  attachment: Attachment
  onClick?: () => void
  onDelete?: () => void
}

export default function AttachmentCard({ attachment: initial, onClick, onDelete }: Props) {
  const [att, setAtt] = useState(initial)

  // Poll embed status until done
  useEffect(() => {
    if (att.embed_status === 'pending' || att.embed_status === 'processing') {
      const interval = setInterval(async () => {
        try {
          const status = await getAttachmentStatus(att.id)
          setAtt(prev => ({ ...prev, embed_status: status.embed_status as any, ai_caption: status.ai_caption }))
          if (status.embed_status === 'done' || status.embed_status === 'skipped') clearInterval(interval)
        } catch { clearInterval(interval) }
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [att.id, att.embed_status])

  const handleDelete = async () => {
    await deleteAttachment(att.id)
    onDelete?.()
  }

  const isProcessing = att.embed_status === 'pending' || att.embed_status === 'processing'

  return (
    <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square">
      {att.file_type === 'image' ? (
        <img
          src={fileUrl(att.thumbnail_path || att.storage_path)}
          alt={att.filename}
          className={`w-full h-full object-cover cursor-pointer transition-opacity ${isProcessing ? 'opacity-60' : ''}`}
          onClick={onClick}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 cursor-pointer" onClick={onClick}>
          {att.file_type === 'video' && <Film size={24} className="text-gray-400" />}
          {att.file_type === 'pdf'   && <FileText size={24} className="text-gray-400" />}
          {att.file_type === 'file'  && <File size={24} className="text-gray-400" />}
          <span className="text-xs text-gray-500 text-center truncate w-full px-1">{att.filename}</span>
        </div>
      )}

      {/* AI processing badge */}
      {isProcessing && (
        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          AI…
        </div>
      )}
      {att.embed_status === 'done' && att.ai_caption && (
        <div className="absolute bottom-1 left-1 bg-brand-500/80 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          ✓
        </div>
      )}

      {/* Delete button */}
      {onDelete && (
        <button onClick={e => { e.stopPropagation(); handleDelete() }}
          className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <X size={10} />
        </button>
      )}
    </div>
  )
}
