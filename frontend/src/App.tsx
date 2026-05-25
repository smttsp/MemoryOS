import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import AppShell from './components/layout/AppShell'
import Today from './pages/Today'
import CollectionPage from './pages/CollectionPage'
import EntryPage from './pages/EntryPage'
import TimelinePage from './pages/TimelinePage'
import ChatPage from './pages/ChatPage'
import SettingsPage from './pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/"           element={<Today />} />
            <Route path="/c/:id"      element={<CollectionPage />} />
            <Route path="/e/:id"      element={<EntryPage />} />
            <Route path="/timeline"   element={<TimelinePage />} />
            <Route path="/chat"       element={<ChatPage />} />
            <Route path="/settings"   element={<SettingsPage />} />
          </Routes>
        </AppShell>
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
