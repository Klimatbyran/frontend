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
export function useVerificationStatus() {
  /**
   * Check if data is AI-generated
   */
  const isAIGenerated = <
    T extends {
      metadata?: {
        verifiedBy?: { name: string } | null;
        user?: { name?: string } | null;
      };
    }
  >(
    data: T | undefined | null
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

  return { isAIGenerated };
}
