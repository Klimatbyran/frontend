/**
 * Gets the procurement requirements text based on the procurement score.
 * @param procurementScore - The procurement score (0, 1, or 2)
 * @param t - Translation function
 * @returns The translated text for the procurement requirements level
 */
export function getProcurementRequirementsText(
  procurementScore: number | undefined,
  t: (key: string) => string,
): string {
  if (procurementScore === 2) {
    return t("municipalityDetailPage.procurementScore.high");
  }
  if (procurementScore === 1) {
    return t("municipalityDetailPage.procurementScore.medium");
  }
  return t("municipalityDetailPage.procurementScore.low");
}
