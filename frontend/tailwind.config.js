/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Mistral Brand & Accent ──────────────────────────────
        primary: {
          DEFAULT: "#F7611E",   // Mistral Orange — primary CTA
          deep:    "#D94F10",   // Pressed / emphasis
          foreground: "#FFFFFF",
        },
        sunshine: {
          300: "#FFCF7A",
          500: "#F99F3F",
          700: "#F07B22",
          800: "#E56518",
          900: "#D04C0E",
        },
        "yellow-sat": "#F9D847",  // Pure brand yellow — sunset stripe stop

        // ── Cream / Neutral Warm ────────────────────────────────
        cream: {
          DEFAULT:  "#FBF5E6",   // Warm yellow-cream surface
          soft:     "#FDF9F0",   // Lighter cream
          deeper:   "#F5EBD0",   // Saturated cream for badge/tag chips
        },
        "beige-deep": "#E8D9BC",  // 1px border on cream surfaces

        // ── Canvas / Surface ────────────────────────────────────
        canvas:        "#FFFFFF",
        surface:       "#F8F8F6",
        "surface-cream":     "#FBF5E6",
        "surface-code":      "#1A1A2E",
        hairline:      "#E8E8E4",
        "hairline-soft":     "#F0F0EC",
        "hairline-strong":   "#D0D0CC",

        // ── Text ────────────────────────────────────────────────
        ink:           "#1A1A18",   // Primary headlines & body
        "ink-tint":    "#2A2A25",   // Hero overlay text (slightly soft)
        charcoal:      "#2C2C28",
        slate:         "#5C5C55",
        steel:         "#8C8C82",
        stone:         "#ACACA0",
        muted:         "#C8C8C0",
        "on-dark":     "#FFFFFF",
        "on-dark-muted": "rgba(255,255,255,0.55)",
        "on-cream":    "#1A1A18",
        link:          "#F7611E",

        // ── Semantic ────────────────────────────────────────────
        destructive: {
          DEFAULT: "#E53535",
          foreground: "#FFFFFF",
        },

        // ── Legacy aliases (keep backward compat with shadcn tokens) ──
        background:  "#FFFFFF",
        foreground:  "#1A1A18",
        border:      "#E8E8E4",
        input:       "#E8E8E4",
        ring:        "#F7611E",
        muted: {
          DEFAULT:    "#F8F8F6",
          foreground: "#8C8C82",
        },
        accent: {
          DEFAULT:    "#FBF5E6",
          foreground: "#1A1A18",
        },
        card: {
          DEFAULT:    "#FFFFFF",
          foreground: "#1A1A18",
        },
        popover: {
          DEFAULT:    "#FFFFFF",
          foreground: "#1A1A18",
        },
      },

      borderRadius: {
        xs:   "4px",
        sm:   "6px",
        md:   "8px",
        lg:   "12px",
        xl:   "16px",
        "2xl": "20px",
        full: "9999px",
      },

      fontFamily: {
        display: ["'Playfair Display'", "'Times New Roman'", "Georgia", "serif"],
        sans:    ["'Inter'", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono:    ["'JetBrains Mono'", "'SF Mono'", "Menlo", "Consolas", "monospace"],
      },

      boxShadow: {
        "elevation-1": "rgba(0,0,0,0.04) 0px 1px 2px 0px",
        "elevation-2": "rgba(0,0,0,0.04) 0px 4px 12px 0px",
        "elevation-3": "rgba(0,0,0,0.08) 0px 12px 24px -4px",
        "elevation-4": "rgba(0,0,0,0.12) 0px 16px 48px -8px",
      },

      animation: {
        "fade-in":   "fadeIn 0.4s ease-out",
        "slide-up":  "slideUp 0.4s ease-out",
        "scale-in":  "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },

      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(16px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        scaleIn: { "0%": { transform: "scale(0.95) translateY(8px)", opacity: "0" }, "100%": { transform: "scale(1) translateY(0)", opacity: "1" } },
      },
    },
  },
  plugins: [],
}
