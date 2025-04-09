/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Covers all files in src
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Essential for Next.js 15 App Router
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // If you have separate components dir
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: '#050505',
        'primary-dark': '#050505',
      },
      boxShadow: {
        soft: '0 8px 32px rgba(0,0,0,0.05)',
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [],
}