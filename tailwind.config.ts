import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#050508',
          50: '#161622',
          100: '#101018',
          200: '#0a0a10',
          900: '#030305',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F3E5AB',
          metallic: '#C5A059',
          dark: '#996515',
        },
        aurora: {
          purple: '#7928CA',
          blue: '#0070F3',
          emerald: '#00DF89',
          rose: '#FF0080',
          cyan: '#00F5D4',
        },
        burgundy: {
          DEFAULT: '#5E1224',
          light: '#8C1D38',
          dark: '#380915',
        },
        rosegold: {
          DEFAULT: '#E0BFB8',
          metallic: '#B76E79',
        },
        titanium: {
          DEFAULT: '#878681',
          light: '#C0C0C7',
          dark: '#4A4A52',
        },
      },
      animation: {
        'aurora-flow': 'auroraFlow 16s ease-in-out infinite alternate',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'float-medium': 'floatSlow 5s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'border-beam': 'borderBeam 6s linear infinite',
        'rgb-shift': 'rgbShift 8s linear infinite',
      },
      keyframes: {
        auroraFlow: {
          '0%': { transform: 'translate(0%, 0%) rotate(0deg) scale(1)' },
          '33%': { transform: 'translate(4%, -4%) rotate(4deg) scale(1.06)' },
          '66%': { transform: 'translate(-3%, 3%) rotate(-3deg) scale(0.97)' },
          '100%': { transform: 'translate(2%, -2%) rotate(2deg) scale(1.04)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.03)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        borderBeam: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        rgbShift: {
          '0%, 100%': { filter: 'hue-rotate(0deg)' },
          '50%': { filter: 'hue-rotate(180deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;

