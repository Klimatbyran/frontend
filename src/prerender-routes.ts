/**
 * Routes to pre-render at build time
 * Add new public routes here that should be pre-rendered for SEO
 */
export const prerenderRoutes = [
  // Home routes (both languages)
  "/sv",
  "/en",

  // Public pages
  "/sv/about",
  "/en/about",
  "/sv/methodology",
  "/en/methodology",
  "/sv/support",
  "/en/support",
  "/sv/privacy",
  "/en/privacy",
  "/sv/products",
  "/en/products",

  // Explore pages
  "/sv/explore",
  "/en/explore",

  // Note: Entity detail pages (companies, municipalities) are not pre-rendered
  // as they require dynamic data. They will be rendered on-demand or via SSR if needed.
];
