import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'
import { UserProfile } from '../hooks/useAuth'
import ThumbnailCard from '../components/ThumbnailCard'
import FilterBar from '../components/FilterBar'

interface RecommendedUser extends UserProfile {
  score: number
  match_percent: number
}

export interface FilterState {
  year: number[]
  branch: string[]
  veg_nonveg: string
  hometown: string
  interests: string[]
}

const EMPTY_FILTERS: FilterState = {
  year: [],
  branch: [],
  veg_nonveg: '',
  hometown: '',
  interests: [],
}

export default function Browse() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'browse' | 'recommended'>('browse')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [recommended, setRecommended] = useState<RecommendedUser[]>([])
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tab === 'browse') fetchBrowse()
    else fetchRecommended()
  }, [tab])

  async function fetchBrowse() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      filters.year.forEach((y) => params.append('year', String(y)))
      filters.branch.forEach((b) => params.append('branch', b))
      if (filters.veg_nonveg) params.set('veg_nonveg', filters.veg_nonveg)
      if (filters.hometown) params.set('hometown', filters.hometown)
      filters.interests.forEach((i) => params.append('interests', i))
      const { data } = await api.get(`/users?${params.toString()}`)
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  async function fetchRecommended() {
    setLoading(true)
    try {
      const { data } = await api.get('/users/recommended')
      setRecommended(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base">
      {/* Navbar */}
      <nav className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-extrabold gradient-text">RoomieMatch</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/me')} className="btn-ghost text-sm">
            My Profile
          </button>
          <button onClick={logout} className="text-muted text-sm hover:text-bright transition-colors">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-bright">
            Hey {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-muted text-sm mt-1">
            {tab === 'browse' ? 'Browse all available roommates' : 'Your top matches based on your profile'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('browse')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'browse'
                ? 'btn-primary'
                : 'btn-ghost'
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setTab('recommended')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'recommended'
                ? 'btn-primary'
                : 'btn-ghost'
            }`}
          >
            ⭐ Recommended
          </button>
        </div>

        {/* Filter bar */}
        {tab === 'browse' && (
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onApply={fetchBrowse}
            onReset={() => { setFilters(EMPTY_FILTERS); setTimeout(fetchBrowse, 0) }}
          />
        )}

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'browse' ? (
          users.length === 0 ? (
            <EmptyState message="No one found with those filters. Try widening your search." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {users.map((u) => <ThumbnailCard key={u.id} user={u} />)}
            </div>
          )
        ) : recommended.length === 0 ? (
          <EmptyState message="Complete your profile to get personalised recommendations." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {recommended.map((u) => (
              <ThumbnailCard key={u.id} user={u} matchPercent={(u as RecommendedUser).match_percent} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-5xl mb-4">🔍</p>
      <p className="text-muted text-base max-w-sm">{message}</p>
    </div>
  )
}
