import { SeoMeta } from "@/types/seo";
import { CompanyDetails } from "@/types/company";
import { Municipality } from "@/types/municipality";
import { getEntityOgImageUrl } from "./ogImages";
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
 * Generate structured data for a company (Organization schema)
 * @param company - Company data
 * @param canonicalUrl - Absolute canonical URL
 * @param description - Page description
 * @param industry - Industry name (optional)
 * @returns JSON-LD structured data object
 */
export function generateCompanyStructuredData(
  company: CompanyDetails,
  canonicalUrl: string,
  description: string,
  industry?: string,
): Record<string, unknown> {
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: canonicalUrl,
    description: description,
  };

  // Add industry if available
  if (industry) {
    structuredData.industry = industry;
  }

  // Add logo if available
  if (company.logoUrl) {
    structuredData.logo = company.logoUrl;
  }

  // Add Wikidata ID if available
  if (company.wikidataId) {
    structuredData.sameAs = `https://www.wikidata.org/entity/${company.wikidataId}`;
  }

  return structuredData;
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
  
  // Use entity-specific OG image (falls back to default if not found)
  const entityId = company.wikidataId || "";
  const ogImage = getEntityOgImageUrl("companies", entityId, true);

  // Generate structured data
  const canonicalUrl = buildAbsoluteUrl(canonical);
  const structuredData = generateCompanyStructuredData(
    company,
    canonicalUrl,
    description,
    options?.industry,
  );

  return {
    title,
    description,
    canonical,
    og: {
      title,
      description,
      image: ogImage,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    structuredData,
  };
}

/**
 * Generate structured data for a municipality (GovernmentOrganization schema)
 * @param municipality - Municipality data
 * @param canonicalUrl - Absolute canonical URL
 * @param description - Page description
 * @returns JSON-LD structured data object
 */
export function generateMunicipalityStructuredData(
  municipality: Municipality,
  canonicalUrl: string,
  description: string,
): Record<string, unknown> {
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: municipality.name,
    url: canonicalUrl,
    description: description,
  };

  // Add address if region is available
  if (municipality.region) {
    structuredData.address = {
      "@type": "PostalAddress",
      addressLocality: municipality.name,
      addressRegion: municipality.region,
      addressCountry: "SE",
    };
  }

  return structuredData;
}

/**
 * Generate SEO meta for a municipality page
 * @param municipality - Municipality data
 * @param pathname - Current pathname
 * @param options - Additional options (lastYear, lastYearEmissionsTon, municipalityId)
 * @returns SeoMeta object
 */
export function generateMunicipalitySeoMeta(
  municipality: Municipality,
  pathname: string,
  options?: {
    lastYear?: number;
    lastYearEmissionsTon?: string;
    municipalityId?: string;
  },
): SeoMeta {
  const title = `${municipality.name} - ${SITE_NAME}`;
  const description = buildMunicipalitySeoDescription(
    municipality,
    options?.lastYear,
    options?.lastYearEmissionsTon,
  );
  const canonical = pathname;
  
  // Use entity-specific OG image (falls back to default if not found)
  // Use municipality name as ID (slugified) or provided ID
  const entityId = options?.municipalityId || municipality.name.toLowerCase().replace(/\s+/g, "-");
  const ogImage = getEntityOgImageUrl("municipalities", entityId, true);

  // Generate structured data
  const canonicalUrl = buildAbsoluteUrl(canonical);
  const structuredData = generateMunicipalityStructuredData(
    municipality,
    canonicalUrl,
    description,
  );

  return {
    title,
    description,
    canonical,
    og: {
      title,
      description,
      image: ogImage,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    structuredData,
  };
}
