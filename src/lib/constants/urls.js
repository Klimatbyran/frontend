/** OpenAPI schema URLs (Garbo `OPENAPI_PREFIX=reference`). */
export const OPENAPI_SCHEMA_URLS = {
  local: "http://localhost:3000/reference/openapi.json",
  staging: "https://stage-api.unearthdata.ai/reference/openapi.json",
  production: "https://api.unearthdata.ai/reference/openapi.json",
};

export const OPENAPI_SCHEMA_URL =
  process.env.OPENAPI_SCHEMA_URL ?? OPENAPI_SCHEMA_URLS.production;
