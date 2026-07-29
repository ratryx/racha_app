import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // paleta base: preto/cinza com verde-lima de destaque
        brand: {
          lime: '#a3e635',
          limeSoft: 'rgba(163,230,53,0.15)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
