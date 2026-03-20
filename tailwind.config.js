/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,js,tsx,jsx}"],
  // theme: {
  //   extend: {},
  // },
  presets: [require("@orderly.network/ui/tailwind.config.js")],
  plugins: [],
};
