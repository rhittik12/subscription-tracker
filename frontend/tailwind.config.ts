import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#000080',
          foreground: '#bfc2ff',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        /* Brutalist palette additions */
        'surface': '#131313',
        'surface-dim': '#131313',
        'surface-bright': '#3a3939',
        'surface-container-lowest': '#0e0e0e',
        'surface-container-low': '#1c1b1b',
        'surface-container': '#201f1f',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353534',
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#c6c5d5',
        'inverse-surface': '#e5e2e1',
        'inverse-on-surface': '#313030',
        'outline': '#908f9e',
        'outline-variant': '#464653',
        'surface-tint': '#bfc2ff',
        'primary-container': '#000080',
      },
      borderRadius: {
        DEFAULT: '0px',
        '2xl': '0px',
        '3xl': '0px',
        lg: '0px',
        md: '0px',
        sm: '0px',
      },
      borderWidth: {
        DEFAULT: '3px',
      },
      spacing: {
        'grid-margin': '2rem',
        'gutter': '1.5rem',
        'shadow-offset': '8px'
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        'label-bold': ['JetBrains Mono', 'ui-monospace', 'monospace'],
        body: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '1.1', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.2', fontWeight: '600' }]
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 12px 40px rgba(0, 0, 0, 0.35)',
        'brutalist': '8px 8px 0 0 #000000',
        'brutalist-sm': '4px 4px 0 0 #000000'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-reflection': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
