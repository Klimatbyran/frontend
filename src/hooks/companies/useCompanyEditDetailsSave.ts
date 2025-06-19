import { useMutation } from "@tanstack/react-query";
import { updateCompanyIndustry, updateCompanyBaseYear } from "@/lib/api";
import type { CompanyDetails } from "@/types/company";

interface SaveCompanyEditDetailsArgs {
  company: CompanyDetails;
  subIndustryCode: string;
  baseYear: string | number;
  comment: string;
  source: string;
  onSave?: () => void;
}

async function saveCompanyEditDetails({
  company,
  subIndustryCode,
  baseYear,
  comment,
  source,
  onSave,
}: SaveCompanyEditDetailsArgs): Promise<void> {
  const metadata: Record<string, string> = {};
  if (comment) metadata.comment = comment;
  if (source) metadata.source = source;
  if (subIndustryCode) {
    await updateCompanyIndustry(
      company.wikidataId,
      subIndustryCode,
      Object.keys(metadata).length ? metadata : undefined,
    );
  }
  if (baseYear) {
    await updateCompanyBaseYear(
      company.wikidataId,
      Number(baseYear),
      Object.keys(metadata).length ? metadata : undefined,
    );
  }
  if (onSave) {
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
