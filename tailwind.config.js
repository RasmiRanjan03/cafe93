/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#151515',
        ink: '#0d0d0d',
        cream: '#FFF5E8',
        chili: '#E53935',
        gold: '#FFC857',
        dough: '#F6F0E8',
        warmgray: '#77716B',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { tightest: '-0.055em' },
    },
  },
  plugins: [],
};
