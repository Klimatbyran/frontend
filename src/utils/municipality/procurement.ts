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
