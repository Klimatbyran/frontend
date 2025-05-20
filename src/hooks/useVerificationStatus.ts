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
import type { ReportingPeriod } from "@/types/company";

export function useVerificationStatus() {
  /**
   * Check if data is AI-generated (generic for any data with metadata)
   */
  const isAIGenerated = <
    T extends {
      metadata?: {
        verifiedBy?: { name: string } | null;
        user?: { name?: string } | null;
      };
    },
  >(
    data: T | undefined | null,
  ): boolean => {
    if (!data) return false;

    // Check if verifiedBy is missing or empty
    const verifiedBy = data.metadata?.verifiedBy;
    const noVerifier =
      !verifiedBy ||
      (typeof verifiedBy.name === "string" &&
        (!verifiedBy.name || verifiedBy.name.trim() === ""));

    // Check if the user is Garbo (Klimatkollen)
    const isGarbo = data.metadata?.user?.name === "Garbo (Klimatkollen)";

    return noVerifier || isGarbo;
  };

  /**
   * Check if any emissions data in a ReportingPeriod is AI-generated
   */
  function isEmissionsAIGenerated(period: ReportingPeriod): boolean {
    if (!period || !period.emissions) return false;

    // Check main emissions object
    if (
      "metadata" in period.emissions &&
      isAIGenerated(period.emissions as any)
    )
      return true;

    // Check individual scope emissions
    if (isAIGenerated(period.emissions.scope1)) return true;
    if (isAIGenerated(period.emissions.scope2)) return true;

    // Check scope 3 categories if they exist
    if (period.emissions.scope3?.categories) {
      for (const category of period.emissions.scope3.categories) {
        if ("metadata" in category && isAIGenerated(category as any))
          return true;
      }
    }
    return false;
  }

  return { isAIGenerated, isEmissionsAIGenerated };
}
