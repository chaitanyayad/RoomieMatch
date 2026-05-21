import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthContext, useAuthState } from './hooks/useAuth'
import Landing from './pages/Landing'
import Setup from './pages/Setup'
import Browse from './pages/Browse'
import ProfileCardPage from './pages/ProfileCardPage'
import MyProfile from './pages/MyProfile'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useAuthState()

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <p className="text-muted text-lg">Loading...</p>
      </div>
    )
  }

  if (!token) return <Navigate to="/" replace />
  if (user && !user.profile_complete) return <Navigate to="/setup" replace />
  return <>{children}</>
}

function SetupRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuthState()
  if (loading) return null
  if (!token) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const authState = useAuthState()

  return (
    <AuthContext.Provider value={authState}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/setup" element={<SetupRoute><Setup /></SetupRoute>} />
          <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><ProfileCardPage /></ProtectedRoute>} />
          <Route path="/me" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
