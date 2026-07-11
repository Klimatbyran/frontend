import { useMutation } from "@tanstack/react-query";
import type { CompanyDetails } from "@/types/company";
import { isVerified } from "@/utils/business/verification";
import { updateCompanyIndustry, updateCompanyBaseYear } from "@/lib/api";

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

function getOriginalCompanyEditValues(company: CompanyDetails) {
  return {
    subIndustryCode: company.industry?.industryGics?.subIndustryCode
      ? String(company.industry.industryGics.subIndustryCode)
      : "",
    industryVerified: isVerified(company.industry?.metadata),
    baseYear: String(company.baseYear?.year || ""),
    baseYearVerified: isVerified(company.baseYear?.metadata),
  };
}

function buildEditMetadata(comment: string, source: string) {
  const metadata: Record<string, string> = {};
  if (comment) metadata.comment = comment;
  if (source) metadata.source = source;
  return metadata;
}

async function updateIndustryIfChanged({
  company,
  subIndustryCode,
  industryVerified,
  originalSubIndustryCode,
  originalIndustryVerified,
  metadata,
}: {
  company: CompanyDetails;
  subIndustryCode: string;
  industryVerified?: boolean;
  originalSubIndustryCode: string;
  originalIndustryVerified: boolean;
  metadata: Record<string, string>;
}) {
  if (
    subIndustryCode === originalSubIndustryCode &&
    industryVerified === originalIndustryVerified
  ) {
    return false;
  }

  const hasMetadata = Object.keys(metadata).length > 0;
  await updateCompanyIndustry(
    company.id,
    subIndustryCode,
    hasMetadata ? metadata : undefined,
    industryVerified,
  );
  return true;
}

async function updateBaseYearIfChanged({
  company,
  baseYear,
  baseYearVerified,
  originalBaseYear,
  originalBaseYearVerified,
  metadata,
}: {
  company: CompanyDetails;
  baseYear: string | number;
  baseYearVerified?: boolean;
  originalBaseYear: string;
  originalBaseYearVerified: boolean;
  metadata: Record<string, string>;
}) {
  if (
    String(baseYear) === originalBaseYear &&
    baseYearVerified === originalBaseYearVerified
  ) {
    return false;
  }

  const hasMetadata = Object.keys(metadata).length > 0;
  await updateCompanyBaseYear(
    company.id,
    Number(baseYear),
    hasMetadata ? metadata : undefined,
    baseYearVerified,
  );
  return true;
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
  const {
    subIndustryCode: originalSubIndustryCode,
    industryVerified: originalIndustryVerified,
    baseYear: originalBaseYear,
    baseYearVerified: originalBaseYearVerified,
  } = getOriginalCompanyEditValues(company);
  const metadata = buildEditMetadata(comment, source);

  const industryChanged = await updateIndustryIfChanged({
    company,
    subIndustryCode,
    industryVerified,
    originalSubIndustryCode,
    originalIndustryVerified,
    metadata,
  });
  const baseYearChanged = await updateBaseYearIfChanged({
    company,
    baseYear,
    baseYearVerified,
    originalBaseYear,
    originalBaseYearVerified,
    metadata,
  });

  if ((industryChanged || baseYearChanged) && onSave) {
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
