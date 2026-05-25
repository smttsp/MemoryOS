export default function EmptyState({ icon, title, description, action }: {
  icon: string; title: string; description?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-gray-700 font-semibold mb-1">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}
