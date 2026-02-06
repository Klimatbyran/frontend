import { SeoMeta } from "@/types/seo";
import { CompanyDetails } from "@/types/company";
import { Municipality } from "@/types/municipality";
import { getCompanyIndustryFromData } from "@/utils/data/industryGrouping";

/**
 * TODO: Expand entity SEO coverage
 *
 * Current coverage:
 * ✅ Companies (generateCompanySeoMeta)
 * ✅ Municipalities (generateMunicipalitySeoMeta)
 *
 * Missing coverage:
 * - Regions: Need generateRegionSeoMeta() for /regions/:id pages
 *   - Similar to municipalities, should include region name, emissions data, Paris Agreement status
 *   - See RegionDetailPage.tsx for data structure
 *
 * Note: Ranked list pages and sector pages use route-level SEO (handled in routes.ts):
 * - /companies (companiesTopListsPage)
 * - /municipalities (MunicipalitiesTopListsPage)
 * - /regions (regionalOverviewPage)
 * - /companies/sectors (CompaniesSectorsPage)
 * These should be handled in routes.ts with getSeoForRoute() rather than entitySeo.ts
 */

const SITE_NAME = "Klimatkollen";
const MAX_DESCRIPTION_LENGTH = 160;
const FALLBACK_DESCRIPTION_SUFFIX =
  "View emissions data and climate transition progress on";

/**
 * Truncate a string to a maximum length, ensuring it ends at a word boundary
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 160)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateDescription(
  text: string,
  maxLength: number = MAX_DESCRIPTION_LENGTH,
): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Find the last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Build a description from parts with fallback
 * @param parts - Array of description parts
 * @param entityName - Name of the entity
 * @param entityType - Type of entity (e.g., "municipality" or empty for companies)
 * @returns Truncated description string
 */
function buildDescriptionFromParts(
  parts: string[],
  entityName: string,
  entityType: string = "",
): string {
  let description = parts.join(" ");

  if (description.length === 0) {
    const entityLabel = entityType ? `${entityName} ${entityType}` : entityName;
    description = `${FALLBACK_DESCRIPTION_SUFFIX} ${entityLabel} on ${SITE_NAME}.`;
  } else {
    description = `${description}. ${FALLBACK_DESCRIPTION_SUFFIX} ${SITE_NAME}.`;
  }

  return truncateDescription(description);
}

/**
 * Build a deterministic SEO description for a company
 * @param company - Company data
 * @param latestYear - Latest reporting year (optional)
 * @returns SEO description string
 */
export function buildCompanySeoDescription(
  company: CompanyDetails,
  latestYear?: number,
): string {
  const parts: string[] = [];

  // Company name
  parts.push(company.name);

  // Industry (extracted directly from company data)
  const industry = getCompanyIndustryFromData(company);
  if (industry) {
    parts.push(`in the ${industry} industry`);
  }

  // Latest emissions data
  const latestPeriod = company.reportingPeriods?.[0];
  const totalEmissions = latestPeriod?.emissions?.calculatedTotalEmissions;

  if (totalEmissions !== undefined && totalEmissions !== null) {
    const emissionsText =
      totalEmissions >= 1000
        ? `${(totalEmissions / 1000).toFixed(1)} thousand`
        : totalEmissions.toFixed(1);
    parts.push(
      `reported ${emissionsText} tCO₂e${latestYear ? ` in ${latestYear}` : ""}`,
    );
  }

  return buildDescriptionFromParts(parts, company.name);
}

/**
 * Build a deterministic SEO description for a municipality
 * @param municipality - Municipality data
 * @param lastYear - Last year with emissions data (optional)
 * @param lastYearEmissionsTon - Formatted emissions string (optional)
 * @returns SEO description string
 */
export function buildMunicipalitySeoDescription(
  municipality: Municipality,
  lastYear?: number,
  lastYearEmissionsTon?: string,
): string {
  const parts: string[] = [];

  // Municipality name
  parts.push(municipality.name);

  // Region
  if (municipality.region) {
    parts.push(`in ${municipality.region}`);
  }

  // Latest emissions
  if (lastYearEmissionsTon && lastYearEmissionsTon !== "No data available") {
    parts.push(
      `reported ${lastYearEmissionsTon}${lastYear ? ` in ${lastYear}` : ""}`,
    );
  }

  // Paris Agreement status
  if (municipality.meetsParisGoal !== undefined) {
    parts.push(
      municipality.meetsParisGoal
        ? "meets Paris Agreement goals"
        : "does not meet Paris Agreement goals",
    );
  }

  return buildDescriptionFromParts(parts, municipality.name, "municipality");
}

/**
 * Generate SEO meta for an entity page
 * @param entityName - Name of the entity
 * @param pathname - Current pathname
 * @param description - SEO description
 * @returns SeoMeta object
 */
function generateEntitySeoMeta(
  entityName: string,
  pathname: string,
  description: string,
): SeoMeta {
  const title = `${entityName} - ${SITE_NAME}`;

  return {
    title,
    description,
    canonical: pathname,
    og: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Generate SEO meta for a company page
 * @param company - Company data
 * @param pathname - Current pathname
 * @param options - Additional options (latestYear)
 * @returns SeoMeta object
 */
export function generateCompanySeoMeta(
  company: CompanyDetails,
  pathname: string,
  options?: {
    latestYear?: number;
  },
): SeoMeta {
  const description = buildCompanySeoDescription(company, options?.latestYear);

  return generateEntitySeoMeta(company.name, pathname, description);
}

/**
 * Generate SEO meta for a municipality page
 * @param municipality - Municipality data
 * @param pathname - Current pathname
 * @param options - Additional options (lastYear, lastYearEmissionsTon)
 * @returns SeoMeta object
 */
export function generateMunicipalitySeoMeta(
  municipality: Municipality,
  pathname: string,
  options?: {
    lastYear?: number;
    lastYearEmissionsTon?: string;
  },
): SeoMeta {
  const description = buildMunicipalitySeoDescription(
    municipality,
    options?.lastYear,
    options?.lastYearEmissionsTon,
  );

  return generateEntitySeoMeta(municipality.name, pathname, description);
}
