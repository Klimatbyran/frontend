# PR 2: Comprehensive SEO Implementation

## Summary

Implements a comprehensive SEO system with automatic meta tag generation, structured data, OG images, and multilingual support. Replaces the basic `PageSEO` component with a feature-rich `Seo` component that handles hreflang tags, tracking parameter stripping, structured data validation, and intelligent OG image fallbacks.

## What Changed

### Enhanced SEO Component

**Before (main):**
- Simple `PageSEO` component with basic meta tags
- Manual configuration required for every page
- No automatic features (hreflang, tracking param stripping, etc.)
- No structured data validation
- Limited OG image support

**After (this branch):**
- Comprehensive `Seo` component with automatic features:
  - **Automatic hreflang tags**: Generates Swedish/English alternates for all pages
  - **Tracking parameter stripping**: Removes utm_*, ref, fbclid, etc. from canonical URLs
  - **OG image fallbacks**: Always provides an og:image URL with intelligent fallbacks
  - **Twitter Card defaults**: Automatically sets card type and image when OG is present
  - **Structured data validation**: Strips undefined values to ensure valid JSON-LD
  - **Locale detection**: Automatically sets og:locale based on current language

### OG Image System

**New utilities** (`src/utils/seo/ogImages.ts`):
- **Entity images**: API-first approach for companies/municipalities (`/api/og/companies/{id}`)
- **Content images**: Build-time generated images for articles/reports (`/og/articles/{id}.png`)
- **Fallback chain**: Entity-specific → Static → Default image
- **Environment control**: `VITE_OG_USE_API` flag for local testing

**Why**: 
- Companies/municipalities use backend API for dynamic, data-driven previews
- Articles/reports use build-time generation since they're frontend-only (markdown/constants)
- Provides consistent fallback behavior across all content types

### Structured Data Generators

**New utilities** (`src/utils/seo/entitySeo.ts`, `src/utils/seo/contentSeo.ts`):
- **Company SEO**: Generates Organization schema with industry, emissions data, Wikidata links
- **Municipality SEO**: Generates GovernmentOrganization schema with address
- **Article SEO**: Generates Article schema with author, date, category, read time
- **Report SEO**: Generates Report schema with PDF as associatedMedia

**Why**: 
- Centralized, reusable generators ensure consistent structured data
- Type-safe with proper TypeScript interfaces
- Handles edge cases (missing data, date formatting, etc.)

### Site-Wide Structured Data

**Layout component** now automatically adds:
- **Organization schema**: Site-wide organization info (name, logo, description)
- **WebSite schema**: Website info with publisher reference

**Why**: 
- Ensures every page has consistent site identification
- Reduces duplication (no need to add Organization to every page)
- Automatically excluded from internal pages (`/internal-pages/*`)

### SEO Utilities

**New utilities** (`src/utils/seo.ts`):
- **`stripTrackingParams()`**: Removes tracking parameters from canonical URLs
- **`stripUndefined()`**: Ensures valid JSON-LD by removing undefined values
- **`buildAbsoluteUrl()`**: Consistent absolute URL generation using `VITE_SITE_ORIGIN`
- **`getSiteOrigin()`**: Centralized origin management

**Why**: 
- Canonical URLs should never include tracking params (SEO best practice)
- JSON-LD must be valid JSON (undefined values cause errors)
- Absolute URLs required for OG images and structured data

### Route-Level SEO Fallbacks

**Enhanced** `src/seo/routes.ts`:
- Provides SEO fallbacks for routes without page-specific SEO
- Uses entity-specific OG images for company/municipality routes
- Falls back to default OG image for unknown routes

**Why**: 
- Ensures all routes have SEO even if page component doesn't define it
- Provides sensible defaults while allowing pages to override

## Improvements Made

### 1. Automatic Hreflang Tags
**Problem**: Bilingual site (sv/en) needs hreflang tags for proper language targeting  
**Solution**: `Seo` component automatically generates hreflang tags for all pages  
**Benefit**: Better search engine understanding of language alternates, improved international SEO

### 2. Tracking Parameter Stripping
**Problem**: Canonical URLs with tracking params (utm_*, ref, etc.) create duplicate content issues  
**Solution**: `stripTrackingParams()` automatically removes tracking params from canonical URLs  
**Benefit**: Clean canonical URLs, prevents duplicate content penalties

### 3. OG Image Fallbacks
**Problem**: Missing or broken OG images result in poor social media previews  
**Solution**: Always provides an og:image URL with intelligent fallback chain  
**Benefit**: Consistent social media previews, better sharing experience

### 4. Structured Data Validation
**Problem**: Undefined values in JSON-LD cause validation errors  
**Solution**: `stripUndefined()` recursively removes undefined/null values  
**Benefit**: Valid JSON-LD, better rich snippet support

### 5. Site-Wide Schema
**Problem**: Each page manually adding Organization schema creates duplication  
**Solution**: Layout automatically adds Organization + WebSite schema to all public pages  
**Benefit**: Consistent site identification, reduced code duplication

### 6. Entity-Specific OG Images
**Problem**: All entity pages using same default OG image  
**Solution**: API endpoints generate dynamic previews with entity data (companies/municipalities)  
**Benefit**: Rich, data-driven social media previews for entity pages

### 7. Content-Specific OG Images
**Problem**: Articles/reports using generic images  
**Solution**: Build-time generation creates preview images with title + excerpt  
**Benefit**: Better social media previews for content pages

## Migration

All pages migrated from `PageSEO` to `Seo` component:
- Pages now use `seoMeta` object instead of individual props
- Entity pages use helper functions (`generateCompanySeoMeta`, etc.)
- Content pages generate structured data inline
- Internal pages automatically excluded from SEO

## Technical Decisions

### Why API-First for Entity OG Images?
- Entities have dynamic data that changes frequently
- Backend can generate previews with latest data on-demand
- Caching at API level is more efficient than build-time generation
- Supports thousands of entities without bloating repo

### Why Build-Time for Content OG Images?
- Articles/reports are frontend-only (markdown files, constants)
- Limited number of content items (~14 articles, ~6 reports)
- Content changes infrequently
- Simpler than requiring backend to duplicate frontend content structure

### Why Automatic Features in Seo Component?
- Reduces boilerplate (don't repeat hreflang, og:image fallbacks, etc.)
- Ensures consistency across all pages
- Prevents common mistakes (missing og:image, invalid JSON-LD, etc.)
- Pages can still override defaults when needed

### Why Site-Wide Structured Data in Layout?
- Organization/WebSite schema should be on every page
- Reduces duplication and ensures consistency
- Automatically excluded from internal pages
- Pages can still add page-specific structured data

## Testing

- ✅ Verify hreflang tags present on all pages
- ✅ Verify canonical URLs don't include tracking params
- ✅ Verify OG images load correctly (API endpoints and static files)
- ✅ Verify structured data is valid JSON-LD (no undefined values)
- ✅ Verify site-wide Organization/WebSite schema on public pages
- ✅ Verify internal pages excluded from SEO

## Files Added

- `src/components/SEO/Seo.tsx` - Comprehensive SEO component
- `src/utils/seo/ogImages.ts` - OG image URL utilities
- `src/utils/seo/entitySeo.ts` - Company/municipality SEO generators
- `src/utils/seo/contentSeo.ts` - Article/report SEO generators
- `scripts/generate-og-images.mjs` - Build-time OG image generation
- `SEO_GUIDE.md` - Comprehensive SEO documentation

## Files Removed

- `src/components/SEO/PageSEO.tsx` - Replaced by `Seo` component
- `src/components/municipalities/detail/MunicipalityDetailSEO.tsx` - Consolidated into utilities
