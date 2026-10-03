/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#3B82F6', dark: '#2563EB', light: '#93C5FD' },
        success: { DEFAULT: '#10B981', dark: '#059669', light: '#6EE7B7' },
        warning: { DEFAULT: '#F59E0B', dark: '#D97706', light: '#FCD34D' },
        danger: { DEFAULT: '#EF4444', dark: '#DC2626', light: '#FCA5A5' },
        info: { DEFAULT: '#6366F1', dark: '#4F46E5', light: '#A5B4FC' },
        ink: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        },
        night: { bg: '#050A14', surface: '#0F192D', card: '#0F192D', sidebar: '#0A1423', hover: '#1A2540', border: '#273042', text: '#E2E8F0', muted: '#94A3B8' },
        neon: { cyan: '#00D2FF', purple: '#9D50BB', blue: '#0B5CFF', pink: '#FF2D8B', violet: '#D63DFC', mint: '#4AE9D1', magenta: '#CE1BFB' },
        chat: { own: '#D9FDD3', 'own-dark': '#005C4B', seen: '#53BDEB', call: '#0B141A' },
        stripe: { DEFAULT: '#635BFF', dark: '#5349E4' },
        google: { blue: '#4285F4', green: '#34A853', yellow: '#FBBC05', red: '#EA4335' },
        signal: { on: '#13D162', 'on-light': '#22E36E', 'on-dark': '#0FA94F', off: '#D13613', 'off-light': '#E64A25', 'off-dark': '#A92A0F' },
        chrome: { rim: '#F0EBEB', glow: '#FBFBFB', handle: '#E5E5E5' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        card: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lift: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        glow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        slideIn: {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        drawCheck: {
          '0%': { strokeDashoffset: '48' },
          '100%': { strokeDashoffset: '0' }
        },
        pulseRing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        slideIn: 'slideIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        scaleIn: 'scaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        drawCheck: 'drawCheck 600ms ease-out forwards',
        pulseRing: 'pulseRing 2s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
