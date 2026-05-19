import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Chat from './components/Chat'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="appShell">
        <div className="loading">Loading…</div>
      </div>
    )
  }

  return <div className="appShell">{user ? <Chat /> : <Login />}</div>
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
