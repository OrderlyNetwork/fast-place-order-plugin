/**
 * PostCSS config used by Storybook's Vite builder.
 * This ensures Tailwind directives in `src/styles.css` are compiled at dev/build time.
 *
 * See also: `tailwind.config.js` for the `content` scan locations.
 */
module.exports = {
  plugins: [require("tailwindcss"), require("autoprefixer")],
};

