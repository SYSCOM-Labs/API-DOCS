/** @type {import('tailwindcss').Config} */

export default {

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {

    extend: {

      colors: {

        surface: {

          DEFAULT: "#f5f5f7",

          raised: "#ffffff",

          sidebar: "#fafafa",

        },

        accent: {

          DEFAULT: "#0071e3",

          hover: "#0077ed",

        },

        ink: {

          DEFAULT: "#1d1d1f",

          secondary: "#6e6e73",

          tertiary: "#86868b",

        },

      },

      fontFamily: {

        sans: [

          "-apple-system",

          "BlinkMacSystemFont",

          "SF Pro Text",

          "SF Pro Display",

          "Segoe UI",

          "Helvetica Neue",

          "Arial",

          "sans-serif",

        ],

        mono: [

          "SF Mono",

          "ui-monospace",

          "Menlo",

          "Monaco",

          "Consolas",

          "monospace",

        ],

      },

      boxShadow: {

        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",

        panel: "0 4px 24px rgba(0,0,0,0.08)",

      },

    },

  },

  plugins: [],

};

