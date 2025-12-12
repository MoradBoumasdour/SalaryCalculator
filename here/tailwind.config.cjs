// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",       // colore di background
        card: "var(--card)",   // colore delle card
        text: "var(--text)",   // colore del testo
        muted: "var(--muted)", // colore secondario
        border: "var(--border)"
      },
    },
  },
  plugins: [],
};
