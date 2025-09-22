# Data Guide System

This directory contains the markdown source files for the data guide content, which provides explanatory information about various metrics and concepts in the Klimatkollen application.

## Overview

The data guide system allows content editors to write explanatory content in markdown format, which is then automatically processed into JSON files that can be consumed by the frontend application.

## Directory Structure

```
src/locales/dataguide/
├── en/                     # English content
│   ├── totalEmissions.md
│   ├── yearOverYearChange.md
│   ├── baseYear.md
│   └── ...
├── sv/                     # Swedish content
│   ├── totalEmissions.md
│   ├── yearOverYearChange.md
│   ├── baseYear.md
│   └── ...
└── README.md              # This file
```

## Content Files

Each markdown file represents one data guide item and should follow this format:

```markdown
# Title of the Guide Item

Content paragraph 1 with **bold text** and other markdown formatting.

Content paragraph 2. Paragraphs are separated by blank lines.

- Bullet points are supported
- As are other markdown features

Content paragraph 3 with [links](https://example.com) and more text.
```

### File Naming Convention

- Use camelCase for file names (e.g., `totalEmissions.md`, `yearOverYearChange.md`)
- The filename (without `.md`) becomes the key used to reference the item in the application
- Keep filenames descriptive but concise
- All the keys are used for Typescript type in `src/data-guide/items.ts` to give type system support for using the items.

### Content Guidelines

1. **Title**: Use a single `# ` heading at the start of the file for the title
2. **Paragraphs**: Separate paragraphs with blank lines
3. **Formatting**: Use standard markdown formatting (bold, italic, links, lists)
4. **Language**: Write content appropriate for the target language (en/sv)
5. **Consistency**: Maintain consistent terminology across all guide items

## Build Process

The markdown files are automatically processed into JSON files during the build process.

### Manual Build

To manually build the data guide files:

```bash
npm run build:dataguide
```

This will:
1. Read all `.md` files from `src/locales/dataguide/{lang}/`
2. Parse the markdown content
3. Generate `public/locales/{lang}/dataguide.json` files

### Automatic Build

The data guide files are automatically built:
- Before each production build (via `prebuild` script)
- Can be manually triggered with `npm run build:dataguide`

## Output Format

The build process generates JSON files with this structure:

```json
{
  "totalEmissions": {
    "title": "What our total emissions represent",
    "content": [
      "First paragraph of content...",
      "Second paragraph of content...",
      "Third paragraph of content..."
    ]
  },
  "yearOverYearChange": {
    "title": "What the year-over-year change shows",
    "content": [
      "Content paragraphs..."
    ]
  }
}
```

## Using the Data Guide in Code

### Loading the Data Guide

Instead of importing from the main translation file, load the data guide separately:

```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation('dataguideItems'); // Load dataguide namespace
const dataGuide = t('', { returnObjects: true }); // Get entire object
```

### Accessing Specific Items

```typescript
// Get a specific item
const totalEmissionsGuide = t('totalEmissions', { returnObjects: true });

// Get the title
const title = t('totalEmissions.title');

// Get the content array
const content = t('totalEmissions.content', { returnObjects: true });
```

## Migration from JSON

The content was originally stored in the main translation files under `dataGuide`. A migration script extracted this content into markdown files.

### Scripts

- `scripts/build-dataguide.js` - Builds markdown files into JSON format

## Editing Content

### Adding New Content

1. Create a new `.md` file in both `en/` and `sv/` directories
2. Use a descriptive camelCase filename
3. Write the content following the format guidelines
4. Run `npm run build:dataguide` to generate the JSON files
5. Update your code to reference the new item key

### Editing Existing Content

1. Edit the appropriate `.md` file(s)
2. Run `npm run build:dataguide` to regenerate JSON files
3. No code changes needed if you're only updating content

### Best Practices

- **Keep it simple**: Use standard markdown formatting
- **Be consistent**: Use the same terminology across languages
- **Test locally**: Always run the build script and test the output
- **Review changes**: Check the generated JSON files to ensure proper formatting
- **Version control**: Commit both the markdown source files and generated JSON files

## Troubleshooting

### Build Issues

If the build script fails:
1. Check that all markdown files have valid syntax
2. Ensure filenames don't contain special characters
3. Verify that both language directories exist

### Content Issues

If content doesn't appear correctly:
1. Check the generated JSON files in `public/locales/{lang}/dataguide.json`
2. Verify the file structure matches the expected format
3. Ensure your code is loading from the correct namespace

### Missing Content

If guide items are missing:
1. Verify the markdown file exists in the correct directory
2. Check that the filename uses the expected camelCase format
3. Run the build script to regenerate JSON files

## Development Workflow

1. **Edit Content**: Modify `.md` files in the appropriate language directory
2. **Build**: Run `npm run build:dataguide` to generate JSON files
3. **Test**: Verify the content appears correctly in the application
4. **Commit**: Include both source `.md` files and generated `.json` files in your commit

This system provides better maintainability, easier content editing, and improved developer experience compared to managing content directly in JSON files.
