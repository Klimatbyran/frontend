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

const { GET } = createClient<paths>({
  baseUrl,
  fetch: (request: Request) => {
    if (typeof window === "undefined" && timeout) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      return fetch(request.url, {
        ...request,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    }
    return fetch(request);
  },
});

// Auth API
export async function authenticateWithGithub(code: string) {
  const { data, error } = await client.POST("/auth/github", {
    body: {
      code,
    } as paths["/auth/github"]["post"]["requestBody"]["content"]["application/json"],
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

export type UpdateCompanyDetailsBody =
  paths["/companies/{wikidataId}"]["post"]["requestBody"]["content"]["application/json"];

export async function updateCompanyDetails(
  wikidataId: string,
  body: UpdateCompanyDetailsBody,
) {
  const { data, error } = await client.POST("/companies/{wikidataId}", {
    params: { path: { wikidataId } },
    body,
  });
  if (error) throw error;
  return data;
}

export async function deleteCompany(wikidataId: string) {
  const { error } = await client.DELETE("/companies/{wikidataId}", {
    params: { path: { wikidataId } },
  });
  if (error) throw error;
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

export async function updateReportingPeriods(
  wikidataId: string,
  body: paths["/companies/{wikidataId}/reporting-periods"]["post"]["requestBody"]["content"]["application/json"],
) {
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

export async function downloadCompanies(
  format: "csv" | "json" | "xlsx",
  year?: string,
) {
  const { data, error } = await client.GET("/companies/export", {
    params: {
      query: {
        type: format,
        year: year,
      },
    },
    parseAs: "blob",
  });

  if (error) throw error;
  return data;
}

export async function downloadMunicipalities(
  format: "csv" | "json" | "xlsx" = "json",
) {
  const { data, error } = await client.GET("/municipalities/export", {
    params: {
      query: { type: format },
    },
    parseAs: "blob",
  });

  if (error) throw error;
  return data;
}

let reportingYearsCache: string[] | null = null;

export async function getReportingYears(): Promise<string[]> {
  if (reportingYearsCache) {
    return reportingYearsCache;
  }

  try {
    const { data, error } = await GET("/reporting-period/years", {});
    if (error) throw error;
    reportingYearsCache = data || [];
    return reportingYearsCache;
  } catch (error) {
    console.error("Error fetching reporting years:", error);
    return [];
  }
}

export async function getValidationClaims(): Promise<Record<string, string>> {
  try {
    const { data, error } = await client.GET("/validation/claim", {});
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching validation claims:", error);
    return {};
  }
}
export async function createValidationClaim(wikidataId: string, steal = false) {
  try {
    const { data, error } = await client.POST(
      "/validation/claim/{wikidataId}",
      {
        params: {
          path: { wikidataId },
        },
        body: { steal }, // empty object
      },
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching validation claims:", error);
    return {};
  }
}

export async function deleteValidationClaim(wikidataId: string) {
  try {
    const { data, error } = await client.DELETE(
      "/validation/claim/{wikidataId}",
      {
        params: {
          path: { wikidataId },
        },
      },
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching validation claims:", error);
    return {};
  }
}

export async function assessEmissions(
  params: paths["/emissions-assessment/"]["post"]["requestBody"]["content"]["application/json"],
) {
  const { data, error } = await client.POST("/emissions-assessment/", {
    body: params,
  });

  if (error) {
    if (
      error.message === "No reporting periods found for the specified years"
    ) {
      throw new Error(
        "No reporting periods found for the selected years. Please choose different years.",
      );
    }
    throw new Error(error.message || "Failed to assess emissions");
  }

  return data;
}

export async function updateCompanyIndustry(
  wikidataId: string,
  subIndustryCode: string,
  metadata?: { source?: string; comment?: string },
  verified?: boolean,
) {
  const { data, error } = await client.POST(
    "/companies/{wikidataId}/industry",
    {
      params: { path: { wikidataId } },
      body: { industry: { subIndustryCode }, metadata, verified },
    },
  );
  if (error) throw error;
  return data;
}

export async function updateCompanyBaseYear(
  wikidataId: string,
  baseYear: number,
  metadata?: { source?: string; comment?: string },
  verified?: boolean,
) {
  const { data, error } = await client.POST(
    "/companies/{wikidataId}/base-year",
    {
      params: { path: { wikidataId } },
      body: { baseYear, metadata, verified },
    },
  );
  if (error) throw error;
  return data;
}

// GICS Industry API
export async function getIndustryGics() {
  const { data, error } = await client.GET("/industry-gics/", {});
  if (error) throw error;
  return data;
}

export const fetchNewsletters = async () => {
  try {
    const response = await fetch(`${baseUrl}/newsletters/`);

    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (err) {
    console.error(err);
  }
};

// Regions API
export async function getRegions() {
  try {
    const { data, error } = await GET("/regions/", {});
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching regions:", error);
    // Return empty array to avoid undefined errors
    return [];
  }
}

export async function getRegionDetails(name: string) {
  const { data, error } = await GET("/regions/{name}", {
    params: { path: { name } },
  });
  if (error) throw error;
  return data;
}

export async function getRegionsKPIs() {
  try {
    const { data, error } = await GET("/regions/kpis", {});
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching regional KPIs:", error);
    return [];
  }
}

// Nation API
export async function getNationDetails() {
  const { data, error } = await GET("/nation/", {});
  if (error) throw error;
  return data;
}

export async function getNationSectorEmissions() {
  const { data, error } = await GET("/nation/sector-emissions", {});
  if (error) throw error;
  return data;
}

// TODO: Add national data to API, this is prep for next stages
export async function getNationalData() {
  try {
    // const { data, error } = await GET("/national-data/", {});
    // if (error) throw error;
    // return data || [];
  } catch (error) {
    console.error("Error fetching national data:", error);
    return [];
  }
}
