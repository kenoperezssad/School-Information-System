/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Navy Primary ─────────────────────────────────────────────────────
        navy: {
          50:  '#EEF2FF',
          100: '#D6DFF5',
          200: '#ADBFEB',
          300: '#7A9ADA',
          400: '#4B75C5',
          500: '#2255AD',
          600: '#1A3F8F',
          700: '#132E72',  // ← primary action
          800: '#0F2258',
          900: '#0A1628',  // ← sidebar dark
          950: '#060D1A',
        },
        // ── Gold Accent ──────────────────────────────────────────────────────
        gold: {
          50:  '#FFFDF0',
          100: '#FDF8D6',
          200: '#FAEEA6',
          300: '#F5DF6B',
          400: '#EDCA35',
          500: '#D4A817',  // ← primary gold
          600: '#C49210',
          700: '#A8780B',
          800: '#8A6008',
          900: '#6B4906',
          950: '#3D2A03',
        },
        // ── Neutral (cool gray) ──────────────────────────────────────────────
        neutral: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
        // ── Legacy aliases (keeps existing maroon references working) ────────
        maroon: {
          50:  '#EEF2FF',
          100: '#D6DFF5',
          200: '#ADBFEB',
          300: '#7A9ADA',
          400: '#4B75C5',
          500: '#2255AD',
          600: '#1A3F8F',
          700: '#132E72',
          800: '#0F2258',
          900: '#0A1628',
          950: '#060D1A',
        },
        brand: {
          50:  '#EEF2FF',
          100: '#D6DFF5',
          200: '#ADBFEB',
          300: '#7A9ADA',
          400: '#4B75C5',
          500: '#2255AD',
          600: '#1A3F8F',
          700: '#132E72',
          800: '#0F2258',
          900: '#0A1628',
        },
        warm: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glass':       '0 4px 24px -4px rgba(10,22,40,0.08), 0 1px 2px rgba(10,22,40,0.04)',
        'glass-hover': '0 12px 40px -6px rgba(10,22,40,0.14), 0 2px 4px rgba(10,22,40,0.06)',
        'glow':        '0 0 24px -4px rgba(19,46,114,0.35)',
        'card':        '0 2px 12px -2px rgba(10,22,40,0.08)',
        'card-hover':  '0 8px 28px -4px rgba(10,22,40,0.14)',
      },
    },
  },
  plugins: [],
}
