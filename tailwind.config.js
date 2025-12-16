/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
        full: "9999px",
      },
      colors: {
        border: "#E5E7EB",
        "border-hover": "#D1D5DB",
        input: "#E5E7EB",
        ring: "#111827",
        background: "#FFFFFF",
        "secondary-bg": "#F9FAFB",
        foreground: "#111827",
        primary: {
          DEFAULT: "#111827",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F3F4F6",
          foreground: "#111827",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#10B981",
          bg: "#D1FAE5",
        },
        error: {
          DEFAULT: "#EF4444",
          bg: "#FEE2E2",
        },
        warning: {
          DEFAULT: "#F59E0B",
        },
        info: {
          DEFAULT: "#3B82F6",
        },
        muted: {
          DEFAULT: "#9CA3AF",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#F3F4F6",
          foreground: "#111827",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
        sidebar: {
          bg: "#FAFAFA",
          "item-hover": "#F3F4F6",
          active: "#E5E7EB",
        },
      },
      boxShadow: {
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
      },
      fontSize: {
        "heading-lg": ["18px", { lineHeight: "1.5", fontWeight: "600" }],
        "heading-md": ["16px", { lineHeight: "1.5", fontWeight: "600" }],
        "heading-sm": ["14px", { lineHeight: "1.5", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["12px", { lineHeight: "1.5", fontWeight: "400" }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

