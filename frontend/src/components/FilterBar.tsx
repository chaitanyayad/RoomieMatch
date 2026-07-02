import { useState } from 'react'
import { ChevronUp, ChevronDown, Leaf, Beef, Utensils } from 'lucide-react'
import { FilterState } from '../pages/Browse'

const BRANCHES = [
  'CSE', 'ECE', 'EEE', 'ME', 'CE', 'BBA', 'MBA',
  'BCA', 'MCA', 'B.Pharm', 'B.Arch', 'Design', 'Law', 'Other',
]
const INTERESTS = [
  'Gaming', 'Music', 'Football', 'Cricket', 'Basketball',
  'Badminton', 'Gym/Fitness', 'Art & Design', 'Movies', 'Travel',
  'Cooking', 'Reading', 'Photography', 'Dance', 'Other',
]

interface Props {
  filters: FilterState
  onChange: (f: FilterState) => void
  onApply: () => void
  onReset: () => void
}

export default function FilterBar({ filters, onChange, onApply, onReset }: Props) {
  const [open, setOpen] = useState(false)

  function toggleYear(y: number) {
    onChange({ ...filters, year: filters.year.includes(y) ? filters.year.filter((v) => v !== y) : [...filters.year, y] })
  }
  function toggleBranch(b: string) {
    onChange({ ...filters, branch: filters.branch.includes(b) ? filters.branch.filter((v) => v !== b) : [...filters.branch, b] })
  }
  function toggleInterest(i: string) {
    onChange({ ...filters, interests: filters.interests.includes(i) ? filters.interests.filter((v) => v !== i) : [...filters.interests, i] })
  }

  const activeCount =
    filters.year.length + filters.branch.length +
    (filters.veg_nonveg ? 1 : 0) + (filters.hometown ? 1 : 0) + filters.interests.length

  return (
    <div className="card mb-6">
      <button onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-bright hover:text-neon-purple transition-colors">
        <span>
          Filters
          {activeCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#A855F7,#22D3EE)', color: '#fff' }}>
              {activeCount}
            </span>
          )}
        </span>
        <span className="text-muted text-xs">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </button>

      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-5">

          {/* Year */}
          <div>
            <p className="section-label">Year</p>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4].map((y) => (
                <button key={y} onClick={() => toggleYear(y)}
                  className={`chip ${filters.year.includes(y) ? 'chip-active' : ''}`}>
                  {y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : '4th'}
                </button>
              ))}
            </div>
          </div>

          {/* Branch */}
          <div>
            <p className="section-label">Branch</p>
            <div className="flex gap-2 flex-wrap">
              {BRANCHES.map((b) => (
                <button key={b} onClick={() => toggleBranch(b)}
                  className={`chip ${filters.branch.includes(b) ? 'chip-active' : ''}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Diet */}
          <div>
            <p className="section-label">Diet</p>
            <div className="flex gap-2 flex-wrap">
              {[{ val: 'veg', label: 'Veg', icon: Leaf }, { val: 'non_veg', label: 'Non-Veg', icon: Beef }, { val: 'both', label: 'Both', icon: Utensils }].map(({ val, label, icon: Icon }) => (
                <button key={val} onClick={() => onChange({ ...filters, veg_nonveg: filters.veg_nonveg === val ? '' : val })}
                  className={`chip inline-flex items-center gap-1.5 ${filters.veg_nonveg === val ? 'chip-active' : ''}`}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Hometown */}
          <div>
            <p className="section-label">Hometown</p>
            <input type="text" value={filters.hometown}
              onChange={(e) => onChange({ ...filters, hometown: e.target.value })}
              placeholder="Search city..." className="input-field max-w-xs" />
          </div>

          {/* Interests */}
          <div>
            <p className="section-label">Interests</p>
            <div className="flex gap-2 flex-wrap">
              {INTERESTS.map((i) => (
                <button key={i} onClick={() => toggleInterest(i)}
                  className={`chip ${filters.interests.includes(i) ? 'chip-active' : ''}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onApply} className="btn-primary text-sm">Apply</button>
            <button onClick={onReset} className="btn-ghost text-sm">Reset</button>
          </div>
        </div>
      )}
    </div>
  )
}
