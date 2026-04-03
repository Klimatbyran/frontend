export function meetsParisAnswerLabel(
  meetsParis: boolean | null,
  t: (key: string) => string,
): string {
  if (meetsParis === true) return t("yes");
  if (meetsParis === false) return t("no");
  return t("companies.card.notEnoughData");
}

export function climatePlanStatusCopy(
  climatePlanHasPlan: boolean | null | undefined,
  t: (key: string) => string,
): string {
  if (climatePlanHasPlan === true) return t("yes");
  if (climatePlanHasPlan === false) return t("no");
  return t("unknown");
}
