import type { CompanyDetails as CompanyDetailsType } from "@/types/company";

export function getDescriptionByLang(
  company: CompanyDetailsType,
  lang: "EN" | "SV",
): string {
  const desc = company.descriptions?.find((d) => d.language === lang);
  return desc?.text ?? "";
}
