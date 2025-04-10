/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        display: [
          "64px",
          {
            lineHeight: "1.1",
            letterSpacing: "-0.02em",
            fontWeight: "300",
          },
        ],
      },
      borderRadius: {
        "level-1": "48px",
        "level-2": "30px",
      },
      colors: {
        border: "transparent",
        input: "transparent",
        ring: "rgb(255 255 255 / 0.1)",
        background: "transparent",
        foreground: "rgb(255 255 255)",
        primary: {
          DEFAULT: "rgb(153, 207, 255)",
          foreground: "rgb(0, 0, 0)",
        },
        secondary: {
          DEFAULT: "rgb(46, 46, 46)",
          foreground: "rgb(255, 255, 255)",
        },
        destructive: {
          DEFAULT: "rgb(240, 117, 154)",
          foreground: "rgb(255, 255, 255)",
        },
        muted: {
          DEFAULT: "rgb(46, 46, 46)",
          foreground: "rgb(135, 135, 135)",
        },
        accent: {
          DEFAULT: "rgb(46, 46, 46)",
          foreground: "rgb(255, 255, 255)",
        },
        popover: {
          DEFAULT: "rgb(18, 18, 18)",
          foreground: "rgb(255, 255, 255)",
        },
        card: {
          DEFAULT: "rgb(18, 18, 18)",
          foreground: "rgb(255, 255, 255)",
        },
        // Base colors
        white: "#F7F7F7",
        grey: "#878787",
        "black-1": "#2E2E2E",
        "black-2": "#121212",
        "black-3": "#000000",

        // Orange palette
        orange: {
          1: "#FDE7CE",
          2: "#FDB768",
          3: "#F48F2A",
          4: "#B25F00",
          5: "#6B3700",
        },

        // Blue palette
        blue: {
          1: "#D4E7F7",
          2: "#99CFFF",
          3: "#59A0E1",
          4: "#206288",
          5: "#13364E",
        },

        // Green palette
        green: {
          1: "#F1FFCC",
          2: "#D5FD63",
          3: "#AAE506",
          4: "#6C9105",
          5: "#3D4B16",
        },

        // Pink palette
        pink: {
          1: "#FAE1E9",
          2: "#EEA0B7",
          3: "#F0759A",
          4: "#97455D",
          5: "#73263D",
        },
      },
      letterSpacing: {
        tightest: "-0.02em",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
