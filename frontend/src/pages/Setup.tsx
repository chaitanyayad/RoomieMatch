import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Leaf, Beef, Utensils } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'
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

export default function Setup() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [year, setYear] = useState<number | null>(null)
  const [branch, setBranch] = useState('')
  const [hometown, setHometown] = useState('')
  const [vegNonveg, setVegNonveg] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [contactInfo, setContactInfo] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 6 ? [...prev, interest] : prev,
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!year || !branch || !contactInfo || !vegNonveg) {
      setError('Please fill in Year, Branch, Diet preference, and Contact info.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const { data } = await api.put('/users/me', {
        year, branch, hometown,
        veg_nonveg: vegNonveg,
        interests,
        contact_info: contactInfo,
        bio,
      })
      updateUser(data)
      navigate('/browse', { replace: true })
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-base py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bright">Set up your profile</h1>
          <p className="text-muted text-sm mt-1">
            Hey {user?.name?.split(' ')[0]} — tell us a bit about yourself
          </p>
        </div>

        {/* Avatar */}
        <div className="card p-5 mb-5">
          <p className="text-sm font-semibold text-bright mb-4">Profile photo (optional)</p>
          <AvatarUpload />
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-7">

          {/* Year */}
          <div>
            <p className="section-label">Year *</p>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4].map((y) => (
                <button key={y} type="button" onClick={() => setYear(y)}
                  className={`chip ${year === y ? 'chip-active' : ''}`}>
                  {y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : '4th'}
                </button>
              ))}
            </div>
          </div>

          {/* Branch */}
          <div>
            <p className="section-label">Branch *</p>
            <select value={branch} onChange={(e) => setBranch(e.target.value)}
              className="input-field">
              <option value="">Select branch</option>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Diet */}
          <div>
            <p className="section-label">Diet *</p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(VEG_LABELS).map(([val, { icon: Icon, text }]) => (
                <button key={val} type="button" onClick={() => setVegNonveg(val)}
                  className={`chip inline-flex items-center gap-1.5 ${vegNonveg === val ? 'chip-active' : ''}`}>
                  <Icon size={14} /> {text}
                </button>
              ))}
            </div>
          </div>

          {/* Hometown */}
          <div>
            <p className="section-label">Hometown</p>
            <input type="text" value={hometown} onChange={(e) => setHometown(e.target.value)}
              placeholder="e.g. Jaipur" className="input-field" />
          </div>

          {/* Interests */}
          <div>
            <p className="section-label">Interests <span className="normal-case">(pick up to 6)</span></p>
            <div className="flex flex-wrap gap-2 mt-2">
              {INTERESTS.map((i) => (
                <button key={i} type="button" onClick={() => toggleInterest(i)}
                  className={`chip ${interests.includes(i) ? 'chip-active' : ''}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="section-label">Contact info * <span className="normal-case">(WhatsApp or email)</span></p>
            <input type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)}
              placeholder="9876543210" className="input-field" />
          </div>

          {/* Bio */}
          <div>
            <p className="section-label">About me ({bio.length}/200)</p>
            <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 200))}
              placeholder="Anything you want people to know..." rows={3}
              className="input-field resize-none" />
          </div>

          {error && <p className="text-neon-pink text-sm font-medium">{error}</p>}

          <button type="submit" disabled={saving} className="btn-primary w-full text-sm inline-flex items-center justify-center gap-1.5">
            {saving ? 'Saving...' : <>Find my roommates <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
