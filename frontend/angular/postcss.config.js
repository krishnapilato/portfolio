module.exports = {
  plugins: [
    // Import TailwindCSS and point to its configuration file
    require("tailwindcss")("./tailwind.config.js"),

    // Add vendor prefixes for cross-browser compatibility
    require("autoprefixer")({
      overrideBrowserslist: ["last 2 versions", "> 1%", "not dead"],
    }),
  ],
};
