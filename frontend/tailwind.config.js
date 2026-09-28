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
        ops: {
          bg: "#0a0d14",
          card: "#0f1422",
          cardHover: "#141b2d",
          panel: "#121827",
          border: "#1e293b",
          borderHighlight: "#334155",
          accent: "#38bdf8",
          memory: "#a855f7",
          memoryLight: "#c084fc",
          memoryBg: "#1e1333",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#f43f5e",
          muted: "#64748b",
          text: "#f1f5f9",
          textMuted: "#94a3b8",
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
