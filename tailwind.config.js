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
        // Base colors - using CSS variables for theme switching
        white: "var(--color-white)",
        grey: "var(--grey)",
        "black-1": "var(--black-1)",
        "black-2": "var(--black-2)",
        "black-3": "var(--black-3)",

        // Orange palette - using CSS variables for theme switching
        orange: {
          1: "var(--orange-1)",
          2: "var(--orange-2)",
          3: "var(--orange-3)",
          4: "var(--orange-4)",
          5: "var(--orange-5)",
        },

        // Blue palette - using CSS variables for theme switching
        blue: {
          1: "var(--blue-1)",
          2: "var(--blue-2)",
          3: "var(--blue-3)",
          4: "var(--blue-4)",
          5: "var(--blue-5)",
        },

        // Green palette - using CSS variables for theme switching
        green: {
          1: "var(--green-1)",
          2: "var(--green-2)",
          3: "var(--green-3)",
          4: "var(--green-4)",
          5: "var(--green-5)",
        },

        // Pink palette - using CSS variables for theme switching
        pink: {
          1: "var(--pink-1)",
          2: "var(--pink-2)",
          3: "var(--pink-3)",
          4: "var(--pink-4)",
          5: "var(--pink-5)",
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
        marquee: {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee var(--duration, 20s) linear infinite",
      },
      perspective: {
        1000: "1000px",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
  ],
};
