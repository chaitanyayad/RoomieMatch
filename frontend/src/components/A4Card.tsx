import type { ReactNode } from 'react'
import { Leaf, Beef, Utensils } from 'lucide-react'
import { UserProfile } from '../hooks/useAuth'
import InitialsAvatar from './InitialsAvatar'
import InterestChip from './InterestChip'

interface Props { user: UserProfile }

const YEAR_LABEL: Record<number, string> = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' }
const VEG_LABEL: Record<string, { icon: typeof Leaf; text: string }> = {
  veg: { icon: Leaf, text: 'Vegetarian' },
  non_veg: { icon: Beef, text: 'Non-Vegetarian' },
  both: { icon: Utensils, text: 'Both' },
}

export default function A4Card({ user }: Props) {
  const diet = user.veg_nonveg ? VEG_LABEL[user.veg_nonveg] : null
  return (
    <div className="card overflow-hidden">
      {/* Gradient top bar */}
      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #A855F7, #22D3EE, #F472B6)' }} />

      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1 mr-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
              Manipal University Jaipur
            </p>
            <h1 className="text-4xl font-extrabold gradient-text leading-tight">{user.name}</h1>
            {user.is_looking && (
              <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)' }}>
                Looking for roommate
              </span>
            )}
          </div>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name}
              className="w-20 h-20 rounded-xl object-cover ring-2 ring-neon-purple/30 flex-shrink-0" />
          ) : (
            <InitialsAvatar name={user.name} size={80} className="rounded-xl" />
          )}
        </div>

        <div className="border-t border-border mb-6" />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-5 mb-7">
          <Field label="Year" value={user.year ? YEAR_LABEL[user.year] : null} />
          <Field label="Branch" value={user.branch} />
          <Field label="Hometown" value={user.hometown} />
          <Field
            label="Diet"
            value={diet && (
              <span className="inline-flex items-center gap-1.5">
                <diet.icon size={14} /> {diet.text}
              </span>
            )}
          />
        </div>

        {/* Interests */}
        {user.interests.length > 0 && (
          <>
            <div className="border-t border-border mb-5" />
            <div className="mb-6">
              <p className="section-label mb-3">Interests</p>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, i) => (
                  <InterestChip key={interest} label={interest} index={i} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Bio */}
        {user.bio && (
          <>
            <div className="border-t border-border mb-5" />
            <div className="mb-6">
              <p className="section-label mb-2">About</p>
              <p className="text-sm text-bright leading-relaxed">{user.bio}</p>
            </div>
          </>
        )}

        {/* Contact */}
        {user.contact_info && (
          <>
            <div className="border-t border-border mb-5" />
            <div>
              <p className="section-label mb-2">Contact</p>
              <p className="text-lg font-bold gradient-text">{user.contact_info}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="section-label">{label}</p>
      <p className="text-sm font-semibold text-bright">{value ?? <span className="text-muted font-normal">—</span>}</p>
    </div>
  )
}
