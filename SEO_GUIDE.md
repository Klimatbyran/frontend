# SEO Implementation Guide

This guide explains how SEO is implemented in Klimatkollen, how to add SEO to new pages, and how to modify existing SEO configurations.

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Adding SEO to a New Page](#adding-seo-to-a-new-page)
4. [Modifying Existing SEO](#modifying-existing-seo)
5. [OG Images](#og-images)
6. [Structured Data](#structured-data)
7. [Common Tasks](#common-tasks)
8. [Testing SEO](#testing-seo)

---

## Overview

### Architecture

Klimatkollen uses a unified SEO system built around a single `Seo` component:

- **Single Component**: All pages use `<Seo meta={seoMeta} />` component
- **Automatic Features**: Canonical URLs, hreflang tags, OpenGraph, Twitter Cards, structured data
- **Site-Wide Schema**: Organization and WebSite schemas added automatically via Layout
- **Page-Specific Schema**: Entity pages, articles, and reports have their own structured data

### Key Files

```
src/
├── components/SEO/
│   └── Seo.tsx                    # Main SEO component
├── utils/seo/
│   ├── ogImages.ts               # OG image URL helpers
│   ├── entitySeo.ts             # Company/municipality SEO generators
│   └── contentSeo.ts             # Article/report SEO generators
├── types/seo.ts                 # TypeScript types
└── seo/routes.ts                # Route-based SEO fallbacks
```

---

## How It Works

### The SEO Component

The `Seo` component (`src/components/SEO/Seo.tsx`) handles all SEO meta tags:

```typescript
<Seo meta={seoMeta} />
```

It automatically generates:
- ✅ Title and description meta tags
- ✅ Canonical URL (with tracking params stripped)
- ✅ Hreflang tags (sv/en/x-default)
- ✅ OpenGraph tags (og:title, og:description, og:image, og:type, og:url, og:site_name, og:locale)
- ✅ Twitter Card tags
- ✅ Robots meta (for noindex pages)
- ✅ JSON-LD structured data

### Site-Wide SEO

The `Layout` component (`src/components/layout/Layout.tsx`) automatically adds:
- Organization schema (site-wide)
- WebSite schema (with search action)
- Excludes internal pages (`/internal-pages/*`) from SEO

### Page-Specific SEO

Each page creates a `seoMeta` object and passes it to the `Seo` component:

```typescript
const seoMeta = {
  title: "Page Title - Klimatkollen",
  description: "Page description",
  canonical: "/path/to/page",
  og: {
    title: "Page Title",
    description: "Page description",
    image: "/path/to/image.png",
    type: "website",
  },
  twitter: {
    title: "Page Title",
    description: "Page description",
  },
  structuredData: { /* JSON-LD schema */ },
};
```

---

## Adding SEO to a New Page

### Step 1: Import the Seo Component

```typescript
import { Seo } from "@/components/SEO/Seo";
import { buildAbsoluteUrl, getDefaultOgImageUrl } from "@/utils/seo";
```

### Step 2: Create SEO Meta Object

Create a `seoMeta` object with the required fields:

```typescript
const seoMeta = {
  title: "Your Page Title - Klimatkollen",
  description: "A clear, concise description of your page (150-160 characters)",
  canonical: location.pathname, // Current page path
  og: {
    title: "Your Page Title",
    description: "Description for social media",
    image: getDefaultOgImageUrl(), // Or custom image
    type: "website", // or "article" for blog posts
  },
  twitter: {
    title: "Your Page Title",
    description: "Description for Twitter",
  },
};
```

### Step 3: Render the Seo Component

Add the component to your JSX:

```typescript
return (
  <>
    <Seo meta={seoMeta} />
    {/* Your page content */}
  </>
);
```

### Complete Example: Simple Static Page

```typescript
import { Seo } from "@/components/SEO/Seo";
import { buildAbsoluteUrl, getDefaultOgImageUrl } from "@/utils/seo";
import { useLocation } from "react-router-dom";

export function MyNewPage() {
  const location = useLocation();
  
  const seoMeta = {
    title: "My New Page - Klimatkollen",
    description: "This is a description of my new page.",
    canonical: location.pathname,
    og: {
      title: "My New Page",
      description: "This is a description of my new page.",
      image: getDefaultOgImageUrl(),
      type: "website",
    },
    twitter: {
      title: "My New Page",
      description: "This is a description of my new page.",
    },
  };

  return (
    <>
      <Seo meta={seoMeta} />
      <div>
        {/* Your page content */}
      </div>
    </>
  );
}
```

### Example: Page with Structured Data

If your page needs structured data (e.g., for rich snippets):

```typescript
import { Seo } from "@/components/SEO/Seo";
import { buildAbsoluteUrl } from "@/utils/seo";

export function MyPageWithSchema() {
  const canonicalUrl = buildAbsoluteUrl("/my-page");
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "My Page",
    url: canonicalUrl,
    description: "Page description",
  };

  const seoMeta = {
    title: "My Page - Klimatkollen",
    description: "Page description",
    canonical: "/my-page",
    og: {
      title: "My Page",
      description: "Page description",
      image: getDefaultOgImageUrl(),
      type: "website",
    },
    structuredData, // Add structured data
  };

  return (
    <>
      <Seo meta={seoMeta} />
      {/* Content */}
    </>
  );
}
```

### Example: No-Index Page

For pages that shouldn't be indexed (error pages, internal dashboards):

```typescript
const seoMeta = {
  title: "Error - Klimatkollen",
  description: "An error occurred",
  canonical: location.pathname,
  noindex: true, // Prevents search engine indexing
  // OG and Twitter tags are optional for noindex pages
};
```

---

## Modifying Existing SEO

### Changing Page Title/Description

Find the page component and update the `seoMeta` object:

```typescript
// Before
const seoMeta = {
  title: "Old Title - Klimatkollen",
  description: "Old description",
  // ...
};

// After
const seoMeta = {
  title: "New Title - Klimatkollen",
  description: "New description",
  // ...
};
```

### Changing OG Image

Update the `og.image` field:

```typescript
// Use default image
og: {
  image: getDefaultOgImageUrl(),
}

// Use custom image
og: {
  image: "/images/custom-image.png",
}

// Use entity-specific image (companies/municipalities)
import { getEntityOgImageUrl } from "@/utils/seo/ogImages";
og: {
  image: getEntityOgImageUrl("companies", companyId),
}
```

### Adding Structured Data

Add a `structuredData` field to your `seoMeta`:

```typescript
import { generateArticleStructuredData } from "@/utils/seo/contentSeo";

const structuredData = generateArticleStructuredData(
  articleMetadata,
  canonicalUrl,
  ogImage
);

const seoMeta = {
  // ... other fields
  structuredData,
};
```

---

## OG Images

### Overview

Open Graph (OG) images are the preview images shown when sharing links on social media (Facebook, Twitter, LinkedIn).

### Image Generation Strategy

| Content Type | Approach | Location |
|-------------|----------|----------|
| **Companies** | API endpoint | `/api/og/companies/{id}` |
| **Municipalities** | API endpoint | `/api/og/municipalities/{id}` |
| **Articles** | Build-time generated | `/og/articles/{id}.png` |
| **Reports** | Build-time generated | `/og/reports/{id}.png` |
| **Default** | Static file | `/logos/Klimatkollen_default.webp` |

### Using OG Images

#### Default Image

```typescript
import { getDefaultOgImageUrl } from "@/utils/seo/ogImages";

og: {
  image: getDefaultOgImageUrl(),
}
```

#### Entity Images (Companies/Municipalities)

```typescript
import { getEntityOgImageUrl } from "@/utils/seo/ogImages";

og: {
  image: getEntityOgImageUrl("companies", companyId),
  // or
  image: getEntityOgImageUrl("municipalities", municipalityId),
}
```

#### Article Images

```typescript
import { getArticleOgImageUrl } from "@/utils/seo/ogImages";

og: {
  image: getArticleOgImageUrl(articleId, metadata.image),
}
```

#### Report Images

```typescript
import { getReportOgImageUrl } from "@/utils/seo/ogImages";

og: {
  image: getReportOgImageUrl(reportId, reportImage),
}
```

### Generating Article/Report OG Images

Article and report OG images are generated at build time:

```bash
npm run generate:og-images
```

This script:
- Reads markdown files from `src/lib/blog/posts/`
- Reads reports from `src/lib/constants/reports.ts`
- Generates preview images to `public/og/articles/` and `public/og/reports/`

**Note**: Companies and municipalities use backend API endpoints (see `BACKEND_OG_API_PROMPT.md`).

---

## Structured Data

### Overview

Structured data (JSON-LD) helps search engines understand your content and enables rich snippets in search results.

### Site-Wide Schema

Automatically added by `Layout` component:
- **Organization**: Site-wide organization info
- **WebSite**: Website info with search action

### Page-Specific Schema

#### Companies

```typescript
import { generateCompanyStructuredData } from "@/utils/seo/entitySeo";

const structuredData = generateCompanyStructuredData(
  company,
  canonicalUrl,
  description,
  industry
);
```

Schema: `Organization` with industry, logo, Wikidata link.

#### Municipalities

```typescript
import { generateMunicipalityStructuredData } from "@/utils/seo/entitySeo";

const structuredData = generateMunicipalityStructuredData(
  municipality,
  canonicalUrl,
  description
);
```

Schema: `GovernmentOrganization` with address.

#### Articles/Blog Posts

```typescript
import { generateArticleStructuredData } from "@/utils/seo/contentSeo";

const structuredData = generateArticleStructuredData(
  articleMetadata,
  canonicalUrl,
  ogImage
);
```

Schema: `Article` with author, date, category, read time.

#### Reports

```typescript
import { generateReportStructuredData } from "@/utils/seo/contentSeo";

const structuredData = generateReportStructuredData(
  reportMetadata,
  canonicalUrl,
  pdfUrl,
  imageUrl
);
```

Schema: `Report` with PDF link as associatedMedia.

### Custom Structured Data

For custom schemas, create the object directly:

```typescript
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Page Name",
  url: canonicalUrl,
  description: "Page description",
};
```

**Important**: Always use `stripUndefined()` utility if your data might have undefined values:

```typescript
import { stripUndefined } from "@/utils/seo";

const cleanedData = stripUndefined(structuredData);
```

---

## Common Tasks

### Adding a New Static Page

1. Create your page component
2. Import `Seo` component
3. Create `seoMeta` object
4. Render `<Seo meta={seoMeta} />`

See [Adding SEO to a New Page](#adding-seo-to-a-new-page) for details.

### Adding a New Entity Page (Company/Municipality)

Use the helper functions:

```typescript
import { generateCompanySeoMeta } from "@/utils/seo/entitySeo";
// or
import { generateMunicipalitySeoMeta } from "@/utils/seo/entitySeo";

const seoMeta = generateCompanySeoMeta(company, industry);
// Includes: title, description, canonical, og, twitter, structuredData
```

### Adding a New Blog Post

Blog posts automatically get SEO from `BlogDetailPage`. Just ensure:
- Markdown file has frontmatter with title, excerpt, date, etc.
- Entry exists in `src/lib/blog/blogPostsList.ts`
- OG image is generated: `npm run generate:og-images`

### Adding a New Report

Reports automatically get SEO from `ReportLandingPage`. Ensure:
- Report entry exists in `src/lib/constants/reports.ts`
- OG image is generated: `npm run generate:og-images`

### Excluding a Page from Search Engines

Add `noindex: true` to `seoMeta`:

```typescript
const seoMeta = {
  title: "Internal Page",
  description: "Internal use only",
  canonical: location.pathname,
  noindex: true, // Prevents indexing
};
```

**Note**: Internal pages (`/internal-pages/*`) are automatically excluded by `Layout`.

### Changing Canonical URL

Update the `canonical` field:

```typescript
const seoMeta = {
  canonical: "/custom/canonical/path", // Defaults to location.pathname
  // ...
};
```

**Note**: Tracking parameters (utm_*, ref, etc.) are automatically stripped from canonical URLs.

### Adding Language-Specific SEO

Hreflang tags are automatically generated. Ensure:
- Page paths follow language pattern: `/sv/...` or `/en/...`
- Both language versions exist
- `canonical` points to the correct language version

---

## Testing SEO

### Manual Testing Checklist

#### 1. View Page Source

Check for:
- ✅ `<title>` tag
- ✅ `<meta name="description">`
- ✅ `<link rel="canonical">`
- ✅ `<link rel="alternate" hreflang="sv">` and `hreflang="en"`
- ✅ OpenGraph tags (`og:title`, `og:description`, `og:image`, etc.)
- ✅ Twitter Card tags
- ✅ JSON-LD structured data (`<script type="application/ld+json">`)

#### 2. Test OG Image

- View source and check `og:image` URL
- Test URL in browser (should load image)
- Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or [Twitter Card Validator](https://cards-dev.twitter.com/validator)

#### 3. Validate Structured Data

- Use [Google Rich Results Test](https://search.google.com/test/rich-results)
- Use [Schema.org Validator](https://validator.schema.org/)

#### 4. Check Canonical URLs

- Verify canonical URL doesn't include tracking params
- Verify canonical points to correct language version

#### 5. Test Social Media Sharing

- Share URL on Facebook/Twitter/LinkedIn
- Verify preview shows correct title, description, and image

### Automated Testing

Consider adding tests for:
- SEO meta tags presence
- Structured data validity
- Canonical URL format
- OG image URLs are absolute

---

## Environment Variables

### `VITE_SITE_ORIGIN`

Required for generating absolute URLs:

```bash
VITE_SITE_ORIGIN=https://klimatkollen.se
```

Used for:
- Canonical URLs
- OG image URLs
- Structured data URLs
- Sitemap URLs

### `VITE_OG_USE_API`

Controls OG image generation (default: `true`):

```bash
# Use API endpoints (production)
VITE_OG_USE_API=true

# Use static files (for local testing)
VITE_OG_USE_API=false
```

---

## Troubleshooting

### OG Image Not Showing

1. Check `og:image` URL is absolute (starts with `http://` or `https://`)
2. Verify image exists at the URL
3. Check image is accessible (not blocked by CORS)
4. Test URL in browser directly

### Structured Data Not Valid

1. Check for `undefined` values (use `stripUndefined()`)
2. Verify required fields are present
3. Test with [Schema.org Validator](https://validator.schema.org/)

### Canonical URL Has Tracking Params

Tracking params are automatically stripped. If they appear:
1. Check `stripTrackingParams()` is being called
2. Verify canonical URL is built using `buildAbsoluteUrl()`

### Hreflang Tags Missing

1. Verify page path includes language (`/sv/...` or `/en/...`)
2. Check both language versions exist
3. Verify `getLanguageUrl()` function works correctly

---

## Additional Resources

- **Backend OG API**: See `BACKEND_OG_API_PROMPT.md` for backend implementation
- **Local Testing**: See `LOCAL_TESTING_OG_API.md` for testing OG images locally
- **Component Source**: `src/components/SEO/Seo.tsx`
- **SEO Utilities**: `src/utils/seo/`

---

## Quick Reference

### Minimal SEO Setup

```typescript
import { Seo } from "@/components/SEO/Seo";
import { getDefaultOgImageUrl } from "@/utils/seo/ogImages";

const seoMeta = {
  title: "Page Title - Klimatkollen",
  description: "Page description",
  canonical: location.pathname,
  og: {
    title: "Page Title",
    description: "Page description",
    image: getDefaultOgImageUrl(),
    type: "website",
  },
};

return <Seo meta={seoMeta} />;
```

### Entity Page SEO

```typescript
import { generateCompanySeoMeta } from "@/utils/seo/entitySeo";

const seoMeta = generateCompanySeoMeta(company, industry);
return <Seo meta={seoMeta} />;
```

### Article SEO

```typescript
import { generateArticleStructuredData } from "@/utils/seo/contentSeo";
import { getArticleOgImageUrl } from "@/utils/seo/ogImages";

const ogImage = getArticleOgImageUrl(articleId, metadata.image);
const structuredData = generateArticleStructuredData(metadata, canonicalUrl, ogImage);

const seoMeta = {
  title: `${metadata.title} - Klimatkollen`,
  description: metadata.excerpt,
  canonical: location.pathname,
  og: {
    title: metadata.title,
    description: metadata.excerpt,
    image: ogImage,
    type: "article",
  },
  structuredData,
};

return <Seo meta={seoMeta} />;
```
