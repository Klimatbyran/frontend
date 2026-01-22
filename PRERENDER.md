# Pre-rendering (SSG) Setup

This project uses pre-rendering to generate static HTML files for public routes, ensuring search engines receive HTML with content and SEO meta tags.

## How It Works

1. **Build**: The app is built normally with `npm run build`
2. **Prerender**: A script uses Puppeteer to visit each route and save the rendered HTML
3. **Output**: Static HTML files are generated in `dist/` for each pre-rendered route

## Adding a New Pre-render Route

To add a new public route for pre-rendering:

1. **Add the route to `src/prerender-routes.ts`**:

```typescript
export const prerenderRoutes = [
  // ... existing routes
  "/sv/your-new-route",
  "/en/your-new-route",
];
```

2. **Ensure the route is public** (not behind authentication)

3. **Rebuild**: Run `npm run build:prerender` to generate the static HTML

## Pre-rendered Routes

The following routes are currently pre-rendered:

- `/sv` and `/en` (home)
- `/sv/about` and `/en/about`
- `/sv/methodology` and `/en/methodology`
- `/sv/support` and `/en/support`
- `/sv/privacy` and `/en/privacy`
- `/sv/products` and `/en/products`
- `/sv/explore` and `/en/explore`

## Entity Pages

Entity detail pages (companies, municipalities) are **not** pre-rendered because they require dynamic data. They will be rendered on-demand when accessed.

## Development

- **Dev mode**: `npm run dev` - Works normally, no prerendering
- **Build with prerender**: `npm run build:prerender` - Builds and prerenders routes
- **Build only**: `npm run build` - Builds without prerendering

## Dependencies

The prerender script requires Puppeteer:

```bash
npm install --save-dev puppeteer
```

## How the Prerender Script Works

1. **Build Check**: Verifies that `dist/index.html` exists (run `npm run build` first)
2. **Local Server**: Starts a local HTTP server on port 4173 to serve the built files
3. **Browser Rendering**: Uses Puppeteer to visit each route and wait for React to render
4. **HTML Extraction**: Extracts the updated `<head>` (with SEO meta tags from Helmet) and `<body>`
5. **File Generation**: Saves the rendered HTML to the appropriate path in `dist/`
6. **Cleanup**: Closes the browser and server

## Output Structure

After prerendering, the `dist/` directory will contain:

```
dist/
  index.html          # Root route
  sv/
    index.html        # /sv route
    about/
      index.html      # /sv/about route
    ...
  en/
    index.html        # /en route
    about/
      index.html      # /en/about route
    ...
```

## Troubleshooting

### Prerender fails

- Ensure `dist/index.html` exists (run `npm run build` first)
- Check that Puppeteer is installed: `npm install --save-dev puppeteer`
- Verify routes are accessible and don't require authentication

### Meta tags not appearing

- Ensure the route uses the `<Seo>` component or route-level SEO
- Check that `react-helmet-async` is properly configured
- Verify the route renders correctly in dev mode first
