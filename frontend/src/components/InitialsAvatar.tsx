interface Props {
  name: string
  size?: number
  className?: string
}

const GRADIENTS = [
  ['#A855F7', '#22D3EE'],
  ['#F472B6', '#A855F7'],
  ['#22D3EE', '#34D399'],
  ['#F59E0B', '#F472B6'],
  ['#34D399', '#22D3EE'],
  ['#A855F7', '#F472B6'],
]

function gradientFromName(name: string): string[] {
  const code = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return GRADIENTS[code % GRADIENTS.length]
}

function initials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function InitialsAvatar({ name, size = 48, className = '' }: Props) {
  const [c1, c2] = gradientFromName(name)
  const fontSize = Math.round(size * 0.38)

  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-bold ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        fontSize,
        color: '#fff',
        letterSpacing: 1,
      }}
    >
      {initials(name)}
    </div>
  )
}
