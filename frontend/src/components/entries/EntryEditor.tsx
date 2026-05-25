import { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useDropzone } from 'react-dropzone'
import { format } from 'date-fns'
import { Bold, Italic, List, ListOrdered, Code, Paperclip, Save } from 'lucide-react'
import { useCollections } from '../../hooks/useCollections'
import { useCreateEntry, useUpdateEntry } from '../../hooks/useEntries'
import { uploadAttachment } from '../../api/attachments'
import TagInput from './TagInput'
import AttachmentGrid from '../attachments/AttachmentGrid'
import type { Entry, Attachment } from '../../types'
import toast from 'react-hot-toast'

interface Props {
  entry?: Entry
  defaultCollectionId?: string
  defaultDate?: string
  onSave?: (entry: Entry) => void
  onCancel?: () => void
}

export default function EntryEditor({ entry, defaultCollectionId, defaultDate, onSave, onCancel }: Props) {
  const { data: collections = [] } = useCollections()
  const createEntry = useCreateEntry()
  const updateEntry = useUpdateEntry()

  const [collectionId, setCollectionId] = useState(entry?.collection_id ?? defaultCollectionId ?? collections[0]?.id ?? '')
  const [title, setTitle]               = useState(entry?.title ?? '')
  const [tags, setTags]                 = useState<string[]>(entry?.tags ?? [])
  const [entryDate, setEntryDate]       = useState(entry?.entry_date ?? defaultDate ?? format(new Date(), 'yyyy-MM-dd'))
  const [attachments, setAttachments]   = useState<Attachment[]>(entry?.attachments ?? [])
  const [uploading, setUploading]       = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write something…' }),
    ],
    content: entry?.body ?? '',
  })

  const onDrop = useCallback(async (files: File[]) => {
    if (!entry) { toast.error('Save the entry first before uploading files'); return }
    setUploading(true)
    for (const file of files) {
      try {
        const att = await uploadAttachment(entry.id, file)
        setAttachments(prev => [...prev, att])
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    setUploading(false)
  }, [entry])

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  })

  const handleSave = async () => {
    if (!collectionId) { toast.error('Select a collection'); return }
    const body = editor?.getHTML() ?? ''
    if (entry) {
      const updated = await updateEntry.mutateAsync({ id: entry.id, data: { title, body, tags, collection_id: collectionId, entry_date: entryDate } })
      onSave?.(updated)
    } else {
      const created = await createEntry.mutateAsync({ collection_id: collectionId, title, body, tags, entry_date: entryDate })
      onSave?.(created)
    }
  }

  const busy = createEntry.isPending || updateEntry.isPending

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50">
        {editor && (
          <>
            <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold size={14} /></ToolBtn>
            <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={14} /></ToolBtn>
            <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="List"><List size={14} /></ToolBtn>
            <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered"><ListOrdered size={14} /></ToolBtn>
            <ToolBtn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Code"><Code size={14} /></ToolBtn>
            <div className="flex-1" />
          </>
        )}
        <button onClick={openFilePicker} title="Attach file" className="p-1.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors">
          <Paperclip size={14} />
        </button>
      </div>

      {/* Meta bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 flex-wrap">
        <select value={collectionId} onChange={e => setCollectionId(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
          <option value="">Select collection</option>
          {collections.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)"
          className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[140px]" />
      </div>

      {/* Editor */}
      <div {...getRootProps()} className={`relative px-4 py-3 min-h-[160px] ${isDragActive ? 'bg-brand-50' : ''}`}>
        <input {...getInputProps()} />
        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-50/80 z-10 rounded pointer-events-none">
            <span className="text-brand-600 font-medium">Drop to attach</span>
          </div>
        )}
        <EditorContent editor={editor} className="text-sm text-gray-800 leading-relaxed" />
      </div>

      {/* Tags */}
      <div className="px-4 py-2 border-t border-gray-100">
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <AttachmentGrid
            attachments={attachments}
            onDelete={id => setAttachments(prev => prev.filter(a => a.id !== id))}
          />
        </div>
      )}

      {uploading && (
        <div className="px-4 py-2 text-xs text-brand-600 border-t border-gray-100">Uploading…</div>
      )}

      {/* Footer buttons */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
        {onCancel && (
          <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
            Cancel
          </button>
        )}
        <button onClick={handleSave} disabled={busy}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors">
          <Save size={14} />
          {busy ? 'Saving…' : entry ? 'Save' : 'Create Entry'}
        </button>
      </div>
    </div>
  )
}

function ToolBtn({ active, onClick, title, children }: {
  active: boolean; onClick: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} title={title}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-200'}`}>
      {children}
    </button>
  )
}
