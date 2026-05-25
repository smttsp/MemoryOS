import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSettings, updateSettings } from '../api/settings'
import { Eye, EyeOff, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const qc = useQueryClient()
  const { data: settings = {}, isLoading } = useQuery({ queryKey: ['settings'], queryFn: getSettings })
  const update = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast.success('Settings saved') },
    onError: () => toast.error('Failed to save settings'),
  })

  const [apiKey, setApiKey]       = useState('')
  const [showKey, setShowKey]     = useState(false)
  const [model, setModel]         = useState('')

  const handleSave = () => {
    const updates: Record<string, string> = {}
    if (apiKey)  updates.openai_api_key = apiKey
    if (model)   updates.openai_model   = model
    if (Object.keys(updates).length === 0) { toast('Nothing to update'); return }
    update.mutate(updates)
    setApiKey('')
  }

  const currentKey = settings.openai_api_key || ''
  const maskedKey  = currentKey ? `sk-…${currentKey.slice(-4)}` : 'Not set'

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
          <p className="text-xs text-gray-400 mb-2">Current: {maskedKey}</p>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-… (leave blank to keep current)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button onClick={() => setShowKey(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chat Model</label>
          <p className="text-xs text-gray-400 mb-2">Current: {settings.openai_model || 'gpt-4o'}</p>
          <select
            value={model || settings.openai_model || 'gpt-4o'}
            onChange={e => setModel(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="gpt-4o">gpt-4o (recommended)</option>
            <option value="gpt-4o-mini">gpt-4o-mini (faster, cheaper)</option>
            <option value="gpt-4-turbo">gpt-4-turbo</option>
          </select>
        </div>

        <button onClick={handleSave} disabled={update.isPending}
          className="flex items-center gap-1.5 w-full justify-center bg-brand-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors">
          <Save size={15} /> Save Settings
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>Data location:</strong> All your data is stored locally on your machine.
        No data is sent to any cloud service except OpenAI API calls (for AI features only).
      </div>
    </div>
  )
}
