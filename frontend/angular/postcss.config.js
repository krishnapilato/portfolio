module.exports = {
  plugins: [
    require("tailwindcss")({
      config: "./tailwind.config.js",
    }),
    require("autoprefixer")({
      overrideBrowserslist: ["last 2 versions", "not dead"],
    }),
    require("cssnano")({ preset: "default" }),
  ],
};