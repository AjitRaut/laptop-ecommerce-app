import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

// Storefront tokens resolve to CSS variables defined in src/index.css.
// (light values on :root, dark values on .dark).
const sfColor = (name) => `rgb(var(--sf-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  // The storefront toggles `.dark` on <html>; admin/vendor pages never set it.
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sf: {
          bg: sfColor('bg'),
          elevated: sfColor('bg-elevated'),
          surface: sfColor('surface'),
          'surface-2': sfColor('surface-2'),
          'surface-3': sfColor('surface-3'),
          ink: sfColor('ink'),
          muted: sfColor('muted'),
          subtle: sfColor('subtle'),
          accent: sfColor('accent'),
          'accent-strong': sfColor('accent-strong'),
          violet: sfColor('violet'),
          'violet-strong': sfColor('violet-strong'),
          cyan: sfColor('cyan'),
          success: sfColor('success'),
          warning: sfColor('warning'),
          danger: sfColor('danger'),
          'on-accent': sfColor('on-accent'),
          device: sfColor('device'),
          'alu-from': sfColor('alu-from'),
          'alu-to': sfColor('alu-to'),
          line: 'var(--sf-line)',
          'line-strong': 'var(--sf-line-strong)',
          glass: 'var(--sf-glass)',
          'glass-strong': 'var(--sf-glass-strong)',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-soft': 'pulseSoft 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'sf-shimmer': 'sf-shimmer 1.6s ease-in-out infinite',
        'sf-marquee': 'sf-marquee 40s linear infinite',
        'sf-drift': 'sf-drift 18s ease-in-out infinite',
        'sf-float': 'sf-float 6s ease-in-out infinite',
        'sf-bounce': 'sf-bounce 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
        'sf-shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'sf-marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'sf-drift': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(2%, -3%, 0) scale(1.06)' },
        },
        'sf-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'sf-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.45)' },
          '60%': { transform: 'scale(0.9)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'sf-gradient': 'linear-gradient(135deg, rgb(var(--sf-accent-strong)) 0%, rgb(var(--sf-violet-strong)) 100%)',
        'sf-plate': 'radial-gradient(120% 90% at 50% 20%, rgb(var(--sf-plate-from)) 0%, rgb(var(--sf-plate-to)) 100%)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -12px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
        'sf-card': 'var(--sf-shadow-card)',
        'sf-float': 'var(--sf-shadow-float)',
        'sf-glow': 'var(--sf-shadow-glow)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        'sf-sm': 'var(--sf-radius-sm)',
        'sf': 'var(--sf-radius)',
        'sf-lg': 'var(--sf-radius-lg)',
        'sf-xl': 'var(--sf-radius-xl)',
      },
      transitionTimingFunction: {
        'sf-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    // `class` strategy: only elements that opt in with form-* classes are reset,
    // so existing admin/vendor form controls keep their current look.
    forms({ strategy: 'class' }),
    typography,
  ],
}