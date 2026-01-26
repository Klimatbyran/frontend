# Open Graph Images

This directory contains entity-specific OG images for social media sharing.

## Automatic Generation

OG images are **automatically generated** at build time using Puppeteer. The images are created from React components with your entity data (name, description) styled consistently.

### Generating Images

Run the generation script:

```bash
npm run generate:og-images
```

**By default, this generates 10 companies and 10 municipalities for testing.**

To generate all entities (⚠️ ~580 images, takes ~15 minutes):

```bash
OG_IMAGE_LIMIT=0 npm run generate:og-images
```

Or set a custom limit:

```bash
OG_IMAGE_LIMIT=50 npm run generate:og-images
```

The script will:
1. Fetch companies and municipalities from your API
2. Generate SEO meta for each entity
3. Render OG images (1200x630px) using Puppeteer
4. Save images to `public/og/companies/{wikidataId}.png` and `public/og/municipalities/{id}.png`

### Performance Considerations

- **Build time**: Generating all ~580 images takes ~15 minutes
- **Repo size**: Each image is ~50-200KB, adding ~58MB to the repository
- **Recommendation**: 
  - For this PR: Keep default limit (10 each) for testing
  - For production: Consider generating on-demand or in a separate CI job

### Build Integration

To generate OG images as part of your build:

```json
{
  "scripts": {
    "prebuild": "npm run generate:og-images && npm run build:dataguide",
    "build": "tsc && vite build"
  }
}
```

## Structure

- `/og/companies/{wikidataId}.png` - Company-specific OG images
- `/og/municipalities/{municipalityId}.png` - Municipality-specific OG images

## Default Fallback

If an entity-specific image doesn't exist, the system falls back to:
- `/logos/Klimatkollen_default.webp`

## Manual Override

You can still manually add custom images:

1. **For companies**: Place the image at `/public/og/companies/{wikidataId}.png`
   - Example: `/public/og/companies/Q12345.png`

2. **For municipalities**: Place the image at `/public/og/municipalities/{municipalityId}.png`
   - Example: `/public/og/municipalities/stockholm.png`
   - Use the municipality name in lowercase, with spaces replaced by hyphens

Manual images will override generated ones if they exist.

## Image Requirements

- **Format**: PNG (recommended) or JPG
- **Dimensions**: 1200x630px (Open Graph standard)
- **File size**: Keep under 1MB for fast loading
- **Content**: Generated images include entity name, description, and Klimatkollen branding

## How It Works

The SEO system automatically:
1. Tries to use entity-specific image at `/og/{entityType}/{id}.png`
2. Falls back to default image if entity image doesn't exist
3. Always provides an absolute URL for og:image meta tag

Generated images are created from the `OgImage` React component (`src/components/og/OgImage.tsx`) which you can customize to match your brand.
