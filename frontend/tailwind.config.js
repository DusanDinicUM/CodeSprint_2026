/** @type {import('tailwindcss').Config} */

// Colors resolve through CSS custom properties (defined in index.css) instead
// of literal hex, so [data-contrast="high"] can flip every bg-*/text-*/border-*
// utility at once - including opacity variants like text-ink/60 - just by
// reassigning the variables on <html>, with no per-component overrides needed.
function withOpacity(variableName) {
  return ({ opacityValue }) =>
    opacityValue === undefined
      ? `rgb(var(${variableName}))`
      : `rgb(var(${variableName}) / ${opacityValue})`
}

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: withOpacity('--color-ink'),
        paper: withOpacity('--color-paper'),
        coral: withOpacity('--color-coral'),
        teal: withOpacity('--color-teal'),
        gold: withOpacity('--color-gold'),
        line: withOpacity('--color-line'),
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Karla"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
