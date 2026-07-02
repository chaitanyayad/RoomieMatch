import { useNavigate } from 'react-router-dom'
import { MapPin, Leaf, Beef, Utensils } from 'lucide-react'
import { UserProfile } from '../hooks/useAuth'
import InitialsAvatar from './InitialsAvatar'
import InterestChip from './InterestChip'

interface Props {
  user: UserProfile
  matchPercent?: number
}

const YEAR_LABEL: Record<number, string> = { 1: '1st yr', 2: '2nd yr', 3: '3rd yr', 4: '4th yr' }
const VEG_LABEL: Record<string, { icon: typeof Leaf; text: string }> = {
  veg: { icon: Leaf, text: 'Veg' },
  non_veg: { icon: Beef, text: 'Non-veg' },
  both: { icon: Utensils, text: 'Both' },
}

export default function ThumbnailCard({ user, matchPercent }: Props) {
  const navigate = useNavigate()
  const diet = user.veg_nonveg ? VEG_LABEL[user.veg_nonveg] : null

  return (
    <div
      onClick={() => navigate(`/profile/${user.id}`)}
      className="card p-5 cursor-pointer hover:border-neon-purple/50 hover:shadow-neon transition-all duration-200 relative group"
    >
      {/* Match badge */}
      {matchPercent !== undefined && (
        <div className="absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'linear-gradient(135deg, #A855F7, #22D3EE)', color: '#fff' }}>
          {matchPercent}% match
        </div>
      )}

      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-4">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-border flex-shrink-0" />
        ) : (
          <InitialsAvatar name={user.name} size={48} />
        )}
        <div className="min-w-0">
          <p className="font-semibold text-bright text-sm truncate">{user.name}</p>
          <p className="text-muted text-xs">
            {user.year ? YEAR_LABEL[user.year] : ''}
            {user.branch ? ` · ${user.branch}` : ''}
          </p>
        </div>
      </div>

      <div className="border-t border-border mb-3" />

      {/* Details */}
      <div className="space-y-1 mb-3">
        {user.hometown && (
          <p className="text-xs text-muted inline-flex items-center gap-1"><MapPin size={12} /> {user.hometown}</p>
        )}
        {diet && (
          <p className="text-xs text-muted inline-flex items-center gap-1">
            <diet.icon size={12} /> {diet.text}
          </p>
        )}
      </div>

      {/* Interests */}
      {user.interests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {user.interests.slice(0, 3).map((interest, i) => (
            <InterestChip key={interest} label={interest} index={i} />
          ))}
          {user.interests.length > 3 && (
            <span className="text-xs text-muted self-center">+{user.interests.length - 3}</span>
          )}
        </div>
      )}
    </div>
  )
}
