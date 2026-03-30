/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2563EB",
          secondary: "#0F172A",
          background: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E5E7EB"
        },
        status: {
          booked: "#F59E0B",
          transit: "#2563EB",
          delivered: "#22C55E",
          failed: "#EF4444"
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"IBM Plex Sans Devanagari"', '"Noto Sans Tamil"', "sans-serif"],
        heading: ['"Sora"', '"Inter"', '"IBM Plex Sans Devanagari"', '"Noto Sans Tamil"', "sans-serif"]
      },
      fontSize: {
        "page-title": ["2rem", { lineHeight: "2.35rem", letterSpacing: "-0.02em" }],
        "section-title": ["1.375rem", { lineHeight: "1.9rem", letterSpacing: "-0.015em" }],
        "card-title": ["1.05rem", { lineHeight: "1.5rem", letterSpacing: "-0.01em" }],
        "body-base": ["0.95rem", { lineHeight: "1.6rem" }],
        helper: ["0.8rem", { lineHeight: "1.2rem" }]
      },
      boxShadow: {
        card: "0 16px 32px rgba(15, 23, 42, 0.08)",
        float: "0 24px 48px rgba(37, 99, 235, 0.14)"
      }
    }
  },
  plugins: []
};

