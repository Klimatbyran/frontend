export function normalizeNationCountry(
  country: { sv: string; en: string } | string,
): { sv: string; en: string } {
  if (typeof country === "string") {
    return { sv: country, en: country === "Sverige" ? "Sweden" : country };
  }

  return { sv: country.sv, en: country.en };
}
