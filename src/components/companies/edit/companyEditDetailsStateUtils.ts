import type { CompanyDetails as CompanyDetailsType } from "@/types/company";
import { isVerified } from "@/utils/business/verification";
import { getDescriptionByLang } from "./companyEditDetailsUtils";

export function getInitialSubIndustryCode(company: CompanyDetailsType): string {
  return company.industry?.industryGics?.subIndustryCode
    ? String(company.industry.industryGics.subIndustryCode)
    : "";
}

export function getGicsErrorMessage(
  isError: boolean,
  error: unknown,
): string | null {
  if (!isError) return null;
  return error instanceof Error
    ? error.message
    : "Failed to load industry options";
}

export function getIndustryValidation(company: CompanyDetailsType) {
  return {
    originalValue: company.industry?.industryGics?.subIndustryCode || "",
    originalVerified: isVerified(company.industry?.metadata),
  };
}

export function getBaseYearValidation(company: CompanyDetailsType) {
  return {
    originalValue: String(company.baseYear?.year || ""),
    originalVerified: isVerified(company.baseYear?.metadata),
  };
}

export function getInitialBasicDetailsState(company: CompanyDetailsType) {
  return {
    name: company.name ?? "",
    descriptionEn: getDescriptionByLang(company, "EN"),
    descriptionSv: getDescriptionByLang(company, "SV"),
    logoUrl: company.logoUrl ?? "",
    lei: company.lei ?? "",
  };
}

export function getInitialIndustryState(company: CompanyDetailsType) {
  return {
    subIndustryCode: getInitialSubIndustryCode(company),
    industryVerified: isVerified(company.industry?.metadata),
    baseYear: String(company.baseYear?.year ?? ""),
    baseYearVerified: isVerified(company.baseYear?.metadata),
  };
}
