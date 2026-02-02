#!/usr/bin/env tsx
 

import { readdirSync, readFileSync } from "fs";
import { join, dirname, basename, relative } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for output
const RED = "\x1b[0;31m";
const GREEN = "\x1b[0;32m";
const YELLOW = "\x1b[1;33m";
const NC = "\x1b[0m"; // No Color

// Recursively find all files matching extensions
function findFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip node_modules
      if (entry.name === "node_modules") {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...findFiles(fullPath, extensions));
      } else if (entry.isFile()) {
        const ext = entry.name.split(".").pop()?.toLowerCase();
        if (ext && extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return files;
}

// Extract component name from file path
function getComponentName(file: string): string {
  let name = basename(file, ".tsx");
  name = basename(name, ".ts");
  return name;
}

// Check if a pattern matches in file content
function fileContainsPattern(filePath: string, pattern: RegExp): boolean {
  try {
    const content = readFileSync(filePath, "utf-8");
    return pattern.test(content);
  } catch {
    return false;
  }
}

// Check if component should be skipped
function shouldSkipComponent(file: string, componentName: string): boolean {
  if (
    componentName === "index" ||
    file.includes("/index.ts") ||
    file.includes("/index.tsx")
  ) {
    return true;
  }
  return file.includes(".test.") || file.includes("/test/");
}

// Create search patterns for component usage
function createSearchPatterns(
  componentName: string,
  importPath: string,
  dirPath: string,
): { patterns: RegExp[]; importPatterns: RegExp[] } {
  const escapedComponentName = componentName.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  const escapedImportPath = importPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const patterns: RegExp[] = [
    new RegExp(`import\\s+.*\\b${escapedComponentName}\\b`),
    new RegExp(`from\\s+["']\\.\\./.*${escapedComponentName}`),
    new RegExp(`from\\s+["']\\./.*${escapedComponentName}`),
    new RegExp(`from\\s+["'].*${escapedComponentName}`),
    new RegExp(`from\\s+["']@/components.*${escapedComponentName}`),
    new RegExp(`from\\s+["']@/components.*${escapedImportPath}`),
    new RegExp(`<${escapedComponentName}\\b`),
  ];

  const importPatterns: RegExp[] = [
    new RegExp(`from\\s+["'].*${escapedImportPath}`),
    new RegExp(`from\\s+["'].*${dirPath}/${componentName}`),
  ];

  return { patterns, importPatterns };
}

// Search for component usage in files
function searchForUsage(
  file: string,
  srcRoot: string,
  patterns: RegExp[],
  importPatterns: RegExp[],
): boolean {
  const searchFiles = findFiles(srcRoot, ["tsx", "ts", "js", "jsx"]);

  for (const searchFile of searchFiles) {
    if (searchFile === file) {
      continue;
    }

    for (const pattern of patterns) {
      if (fileContainsPattern(searchFile, pattern)) {
        return true;
      }
    }

    for (const pattern of importPatterns) {
      if (fileContainsPattern(searchFile, pattern)) {
        return true;
      }
    }
  }

  return false;
}

// Check if component is used
function checkComponentUsage(file: string, srcRoot: string): boolean {
  const componentName = getComponentName(file);

  if (shouldSkipComponent(file, componentName)) {
    return true;
  }

  const relPath = relative(srcRoot, file);
  const dirPath = dirname(relPath);
  const importPath = relPath.replace(/\.tsx?$/, "");

  const { patterns, importPatterns } = createSearchPatterns(
    componentName,
    importPath,
    dirPath,
  );

  return searchForUsage(file, srcRoot, patterns, importPatterns);
}

// Process component files and categorize them
function processComponents(
  componentFiles: string[],
  srcRoot: string,
): { usedCount: number; unusedComponents: string[] } {
  let usedCount = 0;
  const unusedComponents: string[] = [];

  for (const file of componentFiles) {
    if (checkComponentUsage(file, srcRoot)) {
      usedCount++;
    } else {
      unusedComponents.push(file);
    }
  }

  return { usedCount, unusedComponents };
}

// Print the results
function printResults(usedCount: number, unusedComponents: string[]): void {
  const unusedCount = unusedComponents.length;

  console.log("📊 Results:");
  console.log(`  ✅ Used components: ${usedCount}`);
  console.log(`  ❌ Unused components: ${unusedCount}`);
  console.log("");

  if (unusedCount > 0) {
    console.log(`${YELLOW}⚠️  Potentially unused components:${NC}`);
    console.log("");
    for (const component of unusedComponents) {
      console.log(`  ${RED}✗${NC} ${component}`);
    }
    console.log("");
    console.log(
      "⚠️  Note: Some components might be used dynamically or exported from index files.",
    );
    console.log("   Please review manually before deleting.");
  } else {
    console.log(`${GREEN}✓ All components appear to be used!${NC}`);
  }
}

// Main function
function main() {
  console.log("🔍 Checking for unused components...");
  console.log("");

  const srcRoot = join(__dirname, "..", "src");
  const componentsDir = join(srcRoot, "components");
  const componentFiles = findFiles(componentsDir, ["tsx", "ts"]).sort();

  const { usedCount, unusedComponents } = processComponents(
    componentFiles,
    srcRoot,
  );

  printResults(usedCount, unusedComponents);
}

main();
