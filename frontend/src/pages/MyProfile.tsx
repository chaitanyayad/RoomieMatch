import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Leaf, Beef, Utensils, Circle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'
import A4Card from '../components/A4Card'
import AvatarUpload from '../components/AvatarUpload'

const BRANCHES = [
  'CSE', 'ECE', 'EEE', 'ME', 'CE', 'BBA', 'MBA',
  'BCA', 'MCA', 'B.Pharm', 'B.Arch', 'Design', 'Law', 'Other',
]
const INTERESTS = [
  'Gaming', 'Music', 'Football', 'Cricket', 'Basketball',
  'Badminton', 'Gym/Fitness', 'Art & Design', 'Movies', 'Travel',
  'Cooking', 'Reading', 'Photography', 'Dance', 'Other',
]
const VEG_LABELS: Record<string, { icon: typeof Leaf; text: string }> = {
  veg: { icon: Leaf, text: 'Veg' },
  non_veg: { icon: Beef, text: 'Non-Veg' },
  both: { icon: Utensils, text: 'Both' },
}

export default function MyProfile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [year, setYear] = useState<number | null>(user?.year ?? null)
  const [branch, setBranch] = useState(user?.branch ?? '')
  const [hometown, setHometown] = useState(user?.hometown ?? '')
  const [vegNonveg, setVegNonveg] = useState(user?.veg_nonveg ?? '')
  const [interests, setInterests] = useState<string[]>(user?.interests ?? [])
  const [contactInfo, setContactInfo] = useState(user?.contact_info ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [isLooking, setIsLooking] = useState(user?.is_looking ?? true)

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 6 ? [...prev, interest] : prev,
    )
  }

  async function saveProfile() {
    setSaving(true)
    try {
      const { data } = await api.put('/users/me', {
        year, branch, hometown,
        veg_nonveg: vegNonveg,
        interests,
        contact_info: contactInfo,
        bio,
        is_looking: isLooking,
      })
      updateUser(data)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-base py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/browse')}
            className="text-muted hover:text-bright text-sm font-medium transition-colors inline-flex items-center gap-1">
            <ArrowLeft size={16} /> Browse
          </button>
          <div className="flex gap-3">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-ghost text-sm">
                Edit Profile
              </button>
            ) : (
              <>
                <button onClick={() => setEditing(false)} className="text-muted text-sm hover:text-bright transition-colors">
                  Cancel
                </button>
                <button onClick={saveProfile} disabled={saving} className="btn-primary text-sm">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
            <button onClick={logout} className="text-muted text-sm hover:text-neon-pink transition-colors">
              Sign out
            </button>
          </div>
        </div>

        {!editing ? (
          <>
            {/* Looking toggle */}
            <div className="card px-5 py-3 mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-bright inline-flex items-center gap-2">
                <Circle size={10} className={isLooking ? 'fill-emerald-400 text-emerald-400' : 'fill-rose-400 text-rose-400'} />
                {isLooking ? 'Currently looking for a roommate' : 'Not looking right now'}
              </span>
              <button
                onClick={async () => {
                  const newVal = !isLooking
                  setIsLooking(newVal)
                  const { data } = await api.put('/users/me', { is_looking: newVal })
                  updateUser(data)
                }}
                className="text-xs text-muted hover:text-neon-purple underline transition-colors"
              >
                Toggle
              </button>
            </div>
            <A4Card user={{ ...user, is_looking: isLooking }} />
          </>
        ) : (
          <div className="card p-6 space-y-7">
            <h2 className="text-xl font-bold text-bright">Edit Profile</h2>

            <AvatarUpload />

            <div>
              <p className="section-label">Year</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4].map((y) => (
                  <button key={y} type="button" onClick={() => setYear(y)}
                    className={`chip ${year === y ? 'chip-active' : ''}`}>
                    {y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : '4th'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="section-label">Branch</p>
              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="input-field">
                <option value="">Select branch</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <p className="section-label">Diet</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(VEG_LABELS).map(([val, { icon: Icon, text }]) => (
                  <button key={val} type="button" onClick={() => setVegNonveg(val)}
                    className={`chip inline-flex items-center gap-1.5 ${vegNonveg === val ? 'chip-active' : ''}`}>
                    <Icon size={14} /> {text}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="section-label">Hometown</p>
              <input type="text" value={hometown} onChange={(e) => setHometown(e.target.value)}
                className="input-field" />
            </div>

            <div>
              <p className="section-label">Interests (up to 6)</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {INTERESTS.map((i) => (
                  <button key={i} type="button" onClick={() => toggleInterest(i)}
                    className={`chip ${interests.includes(i) ? 'chip-active' : ''}`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="section-label">Contact info</p>
              <input type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)}
                className="input-field" />
            </div>

            <div>
              <p className="section-label">About me ({bio.length}/200)</p>
              <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 200))}
                rows={3} className="input-field resize-none" />
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="looking" checked={isLooking}
                onChange={(e) => setIsLooking(e.target.checked)}
                className="w-4 h-4 accent-neon-purple cursor-pointer" />
              <label htmlFor="looking" className="text-sm text-bright cursor-pointer">
                I'm looking for a roommate
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
