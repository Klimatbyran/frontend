import { execFileSync } from "child_process";
import path from "path";
import {
  OPENAPI_SCHEMA_URL,
  OPENAPI_SCHEMA_URLS,
} from "../src/lib/constants/urls.js";

const schemaUrl = process.argv[2] ?? OPENAPI_SCHEMA_URL;
const outputPath = path.resolve("src/lib/api-types.ts");
const allowedSchemaUrls = new Set(Object.values(OPENAPI_SCHEMA_URLS));

if (!allowedSchemaUrls.has(schemaUrl)) {
  console.error(`Invalid schema URL: ${schemaUrl}`);
  console.error("Allowed URLs:", [...allowedSchemaUrls].join(", "));
  process.exit(1);
}

try {
  console.log(`Fetching OpenAPI schema from: ${schemaUrl}`);
  execFileSync("npx", ["openapi-typescript", schemaUrl, "-o", outputPath], {
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
