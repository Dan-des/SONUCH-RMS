/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        uch: {
          // ── Rich Emerald Teal & Amber Palette ─────────────────────────────
          primary:   '#0f766e',   // Deep Medical Teal Emerald
          secondary: '#0d9488',   // Medium Teal
          accent:    '#14b8a6',   // Vibrant Emerald Teal Accent
          gold:      '#d97706',   // High-contrast Amber Gold CTA
          cta:       '#0284c7',   // Sky Blue Action Highlight
          success:   '#10b981',   // Emerald Green
          danger:    '#ef4444',   // Red

          // ── Dark mode surfaces ─────────────────────────────────────────────
          dark:      '#0b1312',   // Deep Slate Dark
          surface:   '#111c19',   // Dark Surface
          card:      '#172622',   // Dark Card
          border:    '#233a34',   // Dark Stroke
          muted:     '#7f9e95',   // Muted Slate-Teal
          light:     '#f8fafc',   // Crisp White/Slate Text
        }
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        shimmer:   { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
      },
      backgroundImage: {
        'hero-gradient':   'linear-gradient(135deg, #0b1312 0%, #0f766e 50%, #0d9488 100%)',
        'accent-gradient': 'linear-gradient(135deg, #14b8a6, #0f766e)',
        'gold-gradient':   'linear-gradient(135deg, #f59e0b, #d97706)',
      },
    },
  },
  plugins: [],
}
