import createClient from "openapi-fetch";
import type { paths } from "./api-types";
import { authMiddleware } from "./auth-middleware";

// Determine the base URL based on the environment
// For sitemap generation (Node.js environment), use the public API
// For browser environment, use the relative path
export const baseUrl =
  typeof window === "undefined" ? "https://api.klimatkollen.se/api" : "/api";
const client = createClient<paths>({ baseUrl });
client.use(authMiddleware);

// Set a timeout for API requests during sitemap generation
const timeout = typeof window === "undefined" ? 10000 : undefined;

const { GET, POST } = createClient<paths>({
  baseUrl,
  fetch: (url, init) => {
    // Add timeout for Node.js environment
    if (typeof window === "undefined" && timeout) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      return fetch(url, {
        ...init,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    }

    return fetch(url, init);
  },
});

// Auth API
export async function authenticateWithGithub(code: string) {
  const { data, error } = await client.POST("/auth/github", {
    body: {
      code,
    },
  });

  if (error) throw error;

  return data;
}

// Companies API
export async function getCompanies() {
  try {
    const { data, error } = await GET("/companies/", {});
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

export async function getCompanyDetails(id: string) {
  const { data, error } = await client.GET("/companies/{wikidataId}", {
    params: {
      path: {
        wikidataId: id,
      },
    },
  });
  if (error) throw error;
  return data;
}

// Municipalities API
export async function getMunicipalities() {
  try {
    const { data, error } = await GET("/municipalities/", {});
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching municipalities:", error);
    // Return empty array to avoid undefined errors
    return [];
  }
}

export async function getMunicipalityDetails(name: string) {
  const { data, error } = await GET("/municipalities/{name}", {
    params: {
      path: { name },
    },
  });
  if (error) throw error;
  return data;
}

export async function updateReportingPeriods(wikidataId: string, body) {
  const { data, error } = await client.POST(
    "/companies/{wikidataId}/reporting-periods",
    {
      params: {
        path: { wikidataId },
      },
      body,
    },
  );
  if (error) throw error;
  return data;
}
