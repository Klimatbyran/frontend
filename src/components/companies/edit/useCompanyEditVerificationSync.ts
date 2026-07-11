import { useEffect } from "react";
import { isVerified } from "@/utils/business/verification";
import type { CompanyDetails as CompanyDetailsType } from "@/types/company";

export function useIndustryVerificationSync(
  company: CompanyDetailsType,
  subIndustryCode: string,
  setIndustryVerified: (value: boolean) => void,
): void {
  useEffect(() => {
    setIndustryVerified(
      subIndustryCode ===
        (company.industry?.industryGics?.subIndustryCode || "")
        ? isVerified(company.industry?.metadata)
        : false,
    );
  }, [
    subIndustryCode,
    company.industry?.industryGics?.subIndustryCode,
    company.industry?.metadata?.verifiedBy,
    setIndustryVerified,
  ]);
}

export function useBaseYearVerificationSync(
  company: CompanyDetailsType,
  baseYear: string,
  setBaseYearVerified: (value: boolean) => void,
): void {
  useEffect(() => {
    setBaseYearVerified(
      String(baseYear) === String(company.baseYear?.year || "")
        ? isVerified(company.baseYear?.metadata)
        : false,
    );
  }, [
    baseYear,
    company.baseYear?.year,
    company.baseYear?.metadata?.verifiedBy,
    setBaseYearVerified,
  ]);
}
