import { execSync } from "child_process";
import path from "path";
import {
  OPENAPI_SCHEMA_URL,
  OPENAPI_SCHEMA_URLS,
} from "../src/lib/constants/urls.js";

const schemaUrl = process.argv[2] ?? OPENAPI_SCHEMA_URL;
const outputPath = path.resolve("src/lib/api-types.ts");

try {
  console.log(`Fetching OpenAPI schema from: ${schemaUrl}`);
  execSync(`npx openapi-typescript "${schemaUrl}" -o "${outputPath}"`, {
    stdio: "inherit",
  });
} catch (error) {
  console.error(
    "Failed to generate API types:",
    error instanceof Error ? error.message : "Unknown error occurred",
  );
  console.error(
    "URLs: local",
    OPENAPI_SCHEMA_URLS.local,
    "| staging",
    OPENAPI_SCHEMA_URLS.staging,
    "| production",
    OPENAPI_SCHEMA_URLS.production,
  );
  process.exit(1);
}
