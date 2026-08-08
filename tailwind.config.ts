import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-md': 'var(--bg-md)',
        'bg-dk': 'var(--bg-dk)',
        hdr: 'var(--hdr)',
        'hdr-2': 'var(--hdr-2)',
        text: 'var(--text)',
        'text-2': 'var(--text-2)',
        'text-3': 'var(--text-3)',
        accent: 'var(--accent)',
        'accent-d': 'var(--accent-d)',
        border: 'var(--border)',
        sky: 'var(--sky)',
        'sky-m': 'var(--sky-m)',
        'sky-d': 'var(--sky-d)',
      },
    },
  },
  plugins: [],
}

export default config
