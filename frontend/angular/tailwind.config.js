/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Use class-based dark mode
  content: [
    "./src/**/*.{html,ts}", // Include all HTML and TypeScript files
  ],
  theme: {
    extend: {}, // Customize your theme here if needed
  },
  plugins: [require("daisyui")], // Add DaisyUI plugin
  daisyui: {

  },
};