/**
 * Checks if data was AI-generated rather than manually verified
 *
 * Data is considered AI-generated if:
 * 1. metadata.verifiedBy is null/empty, OR
 * 2. metadata.user.name is "Garbo (Klimatkollen)"
 *
 * @param data - Any object with metadata containing verifiedBy and user properties
 * @returns boolean - true if data is AI-generated, false if manually verified
 */
import type {
  ReportingPeriod,
  ReportingPeriodFromList,
  AIGeneratable,
} from "@/types/company";

function hasAIGeneratableMetadata(obj: unknown): obj is AIGeneratable {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "metadata" in obj &&
    typeof (obj as { metadata?: unknown }).metadata === "object"
  );
}

function isDataAIGenerated<T extends AIGeneratable>(
  data: T | undefined | null,
): boolean {
  if (!data) return false;

  const verifiedBy = data.metadata?.verifiedBy;
  const noVerifier =
    !verifiedBy ||
    (typeof verifiedBy.name === "string" &&
      (!verifiedBy.name || verifiedBy.name.trim() === ""));
  const isGarbo = data.metadata?.user?.name === "Garbo (Klimatkollen)";

  return noVerifier || isGarbo;
}

function hasAIGeneratedScope3Categories(
  categories: Array<{ metadata?: unknown }> | undefined,
  isAIGenerated: <T extends AIGeneratable>(data: T | undefined | null) => boolean,
): boolean {
  if (!categories) {
    return false;
  }

  return categories.some(
    (category) =>
      hasAIGeneratableMetadata(category) && isAIGenerated(category),
  );
}

function hasAIGeneratedScopeEmissions(
  emissions: ReportingPeriod["emissions"],
  isAIGenerated: <T extends AIGeneratable>(data: T | undefined | null) => boolean,
): boolean {
  if (!emissions) {
    return false;
  }

  if (
    hasAIGeneratableMetadata(emissions) &&
    isAIGenerated(emissions)
  ) {
    return true;
  }

  if (isAIGenerated(emissions.scope1)) return true;
  if (isAIGenerated(emissions.scope2)) return true;

  const statedTotal = emissions.scope3?.statedTotalEmissions;
  if (
    statedTotal &&
    hasAIGeneratableMetadata(statedTotal) &&
    isAIGenerated(statedTotal)
  ) {
    return true;
  }

  return hasAIGeneratedScope3Categories(
    emissions.scope3?.categories,
    isAIGenerated,
  );
}

export function useVerificationStatus() {
  const isAIGenerated = isDataAIGenerated;

  function isEmissionsAIGenerated(
    period: ReportingPeriod | ReportingPeriodFromList,
  ): boolean {
    if (!period?.emissions) {
      return false;
    }

    return hasAIGeneratedScopeEmissions(period.emissions, isAIGenerated);
  }

  return { isAIGenerated, isEmissionsAIGenerated };
}
