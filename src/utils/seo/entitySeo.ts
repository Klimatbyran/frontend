import { SeoMeta } from "@/types/seo";
import { CompanyDetails } from "@/types/company";
import { Municipality } from "@/types/municipality";
import { buildAbsoluteUrl } from "@/utils/seo";

const SITE_NAME = "Klimatkollen";
const MAX_DESCRIPTION_LENGTH = 160;

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
 * Build a deterministic SEO description for a company
 * @param company - Company data
 * @param industry - Industry name (optional)
 * @param latestYear - Latest reporting year (optional)
 * @returns SEO description string
 */
export function buildCompanySeoDescription(
  company: CompanyDetails,
  industry?: string,
  latestYear?: number,
): string {
  const parts: string[] = [];

  // Company name
  parts.push(company.name);

  // Industry
  if (industry) {
    parts.push(`in the ${industry} industry`);
  }

  // Latest emissions data
  const latestPeriod = company.reportingPeriods?.[0];
  const totalEmissions =
    latestPeriod?.emissions?.calculatedTotalEmissions;

  if (totalEmissions !== undefined && totalEmissions !== null) {
    const emissionsText =
      totalEmissions >= 1000
        ? `${(totalEmissions / 1000).toFixed(1)} thousand`
        : totalEmissions.toFixed(1);
    parts.push(
      `reported ${emissionsText} tCO₂e${latestYear ? ` in ${latestYear}` : ""}`,
    );
  }

  // Build description
  let description = parts.join(" ");
  if (description.length === 0) {
    description = `View emissions data and climate transition progress for ${company.name} on ${SITE_NAME}.`;
  } else {
    description = `${description}. View emissions data and climate transition progress on ${SITE_NAME}.`;
  }

  return truncateDescription(description);
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

  // Build description
  let description = parts.join(" ");
  if (description.length === 0) {
    description = `View emissions data and climate transition progress for ${municipality.name} municipality on ${SITE_NAME}.`;
  } else {
    description = `${description}. View emissions data and climate transition progress on ${SITE_NAME}.`;
  }

  return truncateDescription(description);
}

/**
 * Generate SEO meta for a company page
 * @param company - Company data
 * @param pathname - Current pathname
 * @param options - Additional options (industry, latestYear)
 * @returns SeoMeta object
 */
export function generateCompanySeoMeta(
  company: CompanyDetails,
  pathname: string,
  options?: {
    industry?: string;
    latestYear?: number;
  },
): SeoMeta {
  const title = `${company.name} - ${SITE_NAME}`;
  const description = buildCompanySeoDescription(
    company,
    options?.industry,
    options?.latestYear,
  );
  const canonical = pathname;

  return {
    title,
    description,
    canonical,
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
  const title = `${municipality.name} - ${SITE_NAME}`;
  const description = buildMunicipalitySeoDescription(
    municipality,
    options?.lastYear,
    options?.lastYearEmissionsTon,
  );
  const canonical = pathname;

  return {
    title,
    description,
    canonical,
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
