import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'

export default function Landing() {
  const { token, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/browse', { replace: true })
  }, [token, navigate])

  async function handleGoogleSuccess(response: CredentialResponse) {
    if (!response.credential) return
    try {
      const { data } = await api.post('/auth/google', { id_token: response.credential })
      login(data.access_token, data.user)
      navigate(data.user.profile_complete ? '/browse' : '/setup', { replace: true })
    } catch {
      alert('Sign-in failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #A855F7, transparent)' }} />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #22D3EE, transparent)' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-6xl font-extrabold gradient-text mb-2">RoomieMatch</h1>
          <p className="text-muted text-base font-medium">Manipal University Jaipur</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-bright mb-1">Find your people.</h2>
          <p className="text-muted text-sm mb-8">
            Same year. Same vibe. Browse students and find a roommate who actually fits.
          </p>

          <div className="space-y-3 mb-8">
            {[
              ['🎯', 'Filter by year, branch & diet'],
              ['🎮', 'Match on shared interests'],
              ['⭐', 'Personalised recommendations'],
              ['📋', 'Full profiles with contact info'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span className="text-sm text-muted font-medium">{text}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border mb-6" />

          <p className="text-bright text-sm font-semibold mb-4">Sign in to get started</p>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert('Google sign-in failed')}
            useOneTap
            shape="rectangular"
            size="large"
            text="signin_with"
            theme="filled_black"
          />
        </div>

        <p className="text-center text-muted text-xs mt-6">
          Only for MUJ students &nbsp;•&nbsp; No swiping required
        </p>
      </div>
    </div>
  )
}
