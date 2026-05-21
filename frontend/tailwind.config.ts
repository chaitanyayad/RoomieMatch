import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#080812',
        surface: '#111128',
        card: '#16162E',
        border: '#2A2A50',
        muted: '#64748B',
        bright: '#F1F5F9',
        neon: {
          purple: '#A855F7',
          cyan: '#22D3EE',
          pink: '#F472B6',
          green: '#34D399',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #A855F7, #22D3EE)',
        'gradient-pink': 'linear-gradient(135deg, #F472B6, #A855F7)',
        'gradient-card': 'linear-gradient(135deg, #16162E, #1E1E3A)',
      },
      boxShadow: {
        neon: '0 0 20px rgba(168, 85, 247, 0.3)',
        'neon-cyan': '0 0 20px rgba(34, 211, 238, 0.3)',
        'neon-pink': '0 0 20px rgba(244, 114, 182, 0.3)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
} satisfies Config
