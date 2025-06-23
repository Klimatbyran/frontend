import { useMutation } from "@tanstack/react-query";
import { updateCompanyIndustry, updateCompanyBaseYear } from "@/lib/api";
import type { CompanyDetails } from "@/types/company";

interface SaveCompanyEditDetailsArgs {
  company: CompanyDetails;
  subIndustryCode: string;
  baseYear: string | number;
  comment: string;
  source: string;
  industryVerified?: boolean;
  baseYearVerified?: boolean;
  onSave?: () => void;
}

async function saveCompanyEditDetails({
  company,
  subIndustryCode,
  baseYear,
  comment,
  source,
  industryVerified,
  baseYearVerified,
  onSave,
}: SaveCompanyEditDetailsArgs): Promise<void> {
  // Get original values
  const originalSubIndustryCode = company.industry?.industryGics
    ?.subIndustryCode
    ? String(company.industry.industryGics.subIndustryCode)
    : "";
  const originalIndustryVerified = !!company.industry?.metadata?.verifiedBy;
  const originalBaseYear = String(company.baseYear?.year || "");
  const originalBaseYearVerified = !!company.baseYear?.metadata?.verifiedBy;

  // Prepare metadata if populated
  const metadata: Record<string, string> = {};
  if (comment) metadata.comment = comment;
  if (source) metadata.source = source;
  const hasMetadata = Object.keys(metadata).length > 0;

  let didChange = false;

  // Only update industry if code or verified changed
  if (
    subIndustryCode !== originalSubIndustryCode ||
    industryVerified !== originalIndustryVerified
  ) {
    didChange = true;
    await updateCompanyIndustry(
      company.wikidataId,
      subIndustryCode,
      hasMetadata ? metadata : undefined,
      industryVerified,
    );
  }

  // Only update base year if year or verified changed
  if (
    String(baseYear) !== originalBaseYear ||
    baseYearVerified !== originalBaseYearVerified
  ) {
    didChange = true;
    await updateCompanyBaseYear(
      company.wikidataId,
      Number(baseYear),
      hasMetadata ? metadata : undefined,
      baseYearVerified,
    );
  }

  if (didChange && onSave) {
    onSave();
  }
}

export function useCompanyEditDetailsSave() {
  const { mutate, isPending, error } = useMutation<
    void,
    Error,
    SaveCompanyEditDetailsArgs
  >({
    mutationFn: saveCompanyEditDetails,
  });

  return {
    saveCompanyEditDetails: mutate,
    isPending,
    error,
  };
}
