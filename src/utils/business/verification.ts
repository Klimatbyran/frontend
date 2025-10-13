/**
 * Checks if a field is verified based on metadata
 */
export function isVerified(
  metadata?: { verifiedBy?: { name: string } | null } | null,
): boolean {
  return !!metadata?.verifiedBy;
}
