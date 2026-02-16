/* 
 * Find unused translation keys in locale files.
 *
 * Usage:
 *   node scripts/find-unused-translations.js
 *
 * Assumptions:
 * - Locale files are at: src/locales/sv/translation.json and src/locales/en/translation.json
 * - Keys can be nested objects; they are accessed in code using dot notation, e.g. "header.data".
 * - Keys are referenced in code via:
 *     t('some.key')
 *     i18n.t('some.key')
 *     i18next.t('some.key')
 *     <Trans i18nKey="some.key" />
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

const LOCALES = [
  { code: 'sv', file: path.join(SRC_DIR, 'locales', 'sv', 'translation.json') },
  { code: 'en', file: path.join(SRC_DIR, 'locales', 'en', 'translation.json') },
];

/**
 * Recursively flatten a nested object into dot-separated keys.
 * Example: { header: { data: "x" } } -> ["header.data"]
 */
function flattenKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Recursively walk a directory and return all files matching extensions.
 */
function getSourceFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx']) {
  const result = [];

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        // Skip node_modules and build/dist output if they exist inside src (unlikely)
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') {
          continue;
        }
        walk(fullPath);
      } else {
        if (exts.includes(path.extname(entry.name))) {
          result.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return result;
}

/**
 * Escape string for RegExp.
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Determine whether a key appears to be used in a given file content.
 * We look for common patterns:
 * - 'key.path'
 * - "key.path"
 * - i18nKey="key.path"
 */
function isKeyUsedInContent(key, content) {
  const escaped = escapeRegExp(key);

  // Patterns:
  // 1) t('key.path') or i18n.t('key.path') etc.
  const regexCallSingle = new RegExp(`\\b[t|i18n|i18next\\.t]*\\(['"]${escaped}['"]\\)`);

  // 2) any occurrence in string literals: 'key.path' or "key.path"
  const regexSingle = new RegExp(`'${escaped}'`);
  const regexDouble = new RegExp(`"${escaped}"`);

  // 3) <Trans i18nKey="key.path" />
  const regexTrans = new RegExp(`i18nKey=['"]${escaped}['"]`);

  return (
    regexCallSingle.test(content) ||
    regexSingle.test(content) ||
    regexDouble.test(content) ||
    regexTrans.test(content)
  );
}

function findUnusedKeysForLocale(locale) {
  if (!fs.existsSync(locale.file)) {
    console.warn(`Locale file not found for ${locale.code}: ${locale.file}`);
    return;
  }

  const raw = fs.readFileSync(locale.file, 'utf8');
  const json = JSON.parse(raw);
  const allKeys = flattenKeys(json);

  console.log(`\n=== Locale "${locale.code}" (${allKeys.length} keys) ===`);

  const sourceFiles = getSourceFiles(SRC_DIR);
  console.log(`Scanning ${sourceFiles.length} source files under ${SRC_DIR}...`);

  const usedKeys = new Set();

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');

    for (const key of allKeys) {
      if (usedKeys.has(key)) continue;

      if (isKeyUsedInContent(key, content)) {
        usedKeys.add(key);
      }
    }
  }

  const unusedKeys = allKeys.filter((k) => !usedKeys.has(k));

  console.log(`Found ${unusedKeys.length} potentially unused keys out of ${allKeys.length}.`);

  if (unusedKeys.length > 0) {
    console.log('\nPotentially unused keys:');
    for (const key of unusedKeys) {
      console.log(`- ${key}`);
    }
  } else {
    console.log('No unused keys detected.');
  }
}

function main() {
  console.log(`Project root: ${PROJECT_ROOT}`);

  for (const locale of LOCALES) {
    findUnusedKeysForLocale(locale);
  }
}

main();

