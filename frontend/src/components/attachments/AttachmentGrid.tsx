import { useState } from 'react'
import AttachmentCard from './AttachmentCard'
import MediaLightbox from './MediaLightbox'
import type { Attachment } from '../../types'

interface Props {
  attachments: Attachment[]
  onDelete?: (id: string) => void
}

export default function AttachmentGrid({ attachments, onDelete }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const images = attachments.filter(a => a.file_type === 'image')
  const imageIdxMap = new Map(images.map((a, i) => [a.id, i]))

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {attachments.map(a => (
          <AttachmentCard
            key={a.id}
            attachment={a}
            onClick={a.file_type === 'image' ? () => setLightboxIdx(imageIdxMap.get(a.id) ?? 0) : undefined}
            onDelete={onDelete ? () => onDelete(a.id) : undefined}
          />
        ))}
      </div>
      {lightboxIdx !== null && images.length > 0 && (
        <MediaLightbox
          images={images}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  )
}
