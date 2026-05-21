import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { UserProfile } from '../hooks/useAuth'
import A4Card from '../components/A4Card'

export default function ProfileCardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(`/users/${id}`)
      .then(({ data }) => setUser(data))
      .catch(() => setError('Could not load this profile.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center gap-4">
        <p className="text-neon-pink text-lg font-semibold">{error || 'Profile not found.'}</p>
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm">
          ← Go back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-muted hover:text-bright text-sm font-medium mb-6 inline-flex items-center gap-1 transition-colors"
        >
          ← Back to browse
        </button>
        <A4Card user={user} />
      </div>
    </div>
  )
}
