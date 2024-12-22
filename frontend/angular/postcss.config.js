module.exports = {
  plugins: [
    require("tailwindcss")("./tailwind.config.js"),
    require("autoprefixer")({
      overrideBrowserslist: ["last 2 versions", "> 1%", "not dead"],
    }),
  ],
};