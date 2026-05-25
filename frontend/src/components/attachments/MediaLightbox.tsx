import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { fileUrl } from '../../api/client'
import type { Attachment } from '../../types'

interface Props {
  images: Attachment[]
  index: number
  onClose: () => void
}

export default function MediaLightbox({ images, index, onClose }: Props) {
  const slides = images.map(a => ({
    src: fileUrl(a.storage_path),
    alt: a.filename,
    description: a.ai_caption || a.user_note || a.filename,
  }))

  return (
    <Lightbox
      open
      close={onClose}
      slides={slides}
      index={index}
    />
  )
}
