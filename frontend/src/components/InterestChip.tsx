interface Props {
  label: string
  index?: number
}

const COLORS = [
  'text-neon-purple border-neon-purple/40 bg-neon-purple/10',
  'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10',
  'text-neon-pink border-neon-pink/40 bg-neon-pink/10',
  'text-neon-green border-neon-green/40 bg-neon-green/10',
]

export default function InterestChip({ label, index = 0 }: Props) {
  const color = COLORS[index % COLORS.length]
  return (
    <span className={`inline-block border rounded-full px-3 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}
