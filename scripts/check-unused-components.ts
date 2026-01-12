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

// Check if component is used
function checkComponentUsage(file: string, srcRoot: string): boolean {
  const componentName = getComponentName(file);

  // Skip index files and utility files
  if (
    componentName === "index" ||
    file.includes("/index.ts") ||
    file.includes("/index.tsx")
  ) {
    return true; // Consider it "used" to skip it
  }

  // Skip test files
  if (file.includes(".test.") || file.includes("/test/")) {
    return true; // Consider it "used" to skip it
  }

  // Get directory structure to build import paths
  const relPath = relative(srcRoot, file);
  const dirPath = dirname(relPath);
  const importPath = relPath.replace(/\.tsx?$/, "");

  // Escape component name for regex
  const escapedComponentName = componentName.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

  // Check various import patterns
  const patterns: RegExp[] = [
    // Import statements with component name
    new RegExp(`import\\s+.*\\b${escapedComponentName}\\b`),
    new RegExp(`from\\s+["']\\.\\./.*${escapedComponentName}`),
    new RegExp(`from\\s+["']\\./.*${escapedComponentName}`),
    new RegExp(`from\\s+["'].*${escapedComponentName}`),
    new RegExp(`from\\s+["']@/components.*${escapedComponentName}`),
    new RegExp(
      `from\\s+["']@/components.*${importPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    ),
    // JSX usage
    new RegExp(`<${escapedComponentName}\\b`),
  ];

  // Also check for the file path as import
  const importPatterns: RegExp[] = [
    new RegExp(
      `from\\s+["'].*${importPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    ),
    new RegExp(`from\\s+["'].*${dirPath}/${componentName}`),
  ];

  // Find all source files to search
  const searchFiles = findFiles(srcRoot, ["tsx", "ts", "js", "jsx"]);

  // Search for usage (excluding the file itself)
  for (const searchFile of searchFiles) {
    if (searchFile === file) {
      continue;
    }

    // Check component name patterns
    for (const pattern of patterns) {
      if (fileContainsPattern(searchFile, pattern)) {
        return true; // Component is used
      }
    }

    // Check import path patterns
    for (const pattern of importPatterns) {
      if (fileContainsPattern(searchFile, pattern)) {
        return true; // Component is used
      }
    }
  }

  return false; // Component is unused
}

// Main function
function main() {
  console.log("🔍 Checking for unused components...");
  console.log("");

  const srcRoot = join(__dirname, "..", "src");
  const componentsDir = join(srcRoot, "components");

  // Find all component files
  const componentFiles = findFiles(componentsDir, ["tsx", "ts"]).sort();

  let unusedCount = 0;
  let usedCount = 0;
  const unusedComponents: string[] = [];

  // Process each component file
  for (const file of componentFiles) {
    if (checkComponentUsage(file, srcRoot)) {
      usedCount++;
    } else {
      unusedComponents.push(file);
      unusedCount++;
    }
  }

  // Print results
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

main();
