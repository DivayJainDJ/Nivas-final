export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        product: {
          navy: '#0b1630',
          slate: '#31415f',
          indigo: '#5b6ee1',
          cyan: '#56c7d8',
          green: '#2f9d72',
          cloud: '#f7faff',
          mist: '#e8eef8',
          line: '#d9e2ef',
          ink: '#111827',
          muted: '#64748b',
          warm: '#f4c47a',
        },
        command: {
          ink: '#07110f',
          panel: '#0d1815',
          panel2: '#12211d',
          line: '#294238',
          amber: '#d7a32f',
          signal: '#34d399',
          danger: '#e85d4f',
          muted: '#8ea69a',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'IBM Plex Sans', 'Segoe UI', 'sans-serif'],
        display: ['Sora', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        command: '0 18px 60px rgba(0, 0, 0, 0.28)',
        premium: '0 24px 80px rgba(31, 45, 72, 0.16)',
        soft: '0 12px 36px rgba(31, 45, 72, 0.11)',
      },
    },
  },
  plugins: [],
}
