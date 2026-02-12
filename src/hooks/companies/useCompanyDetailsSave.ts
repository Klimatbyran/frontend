import { useMutation } from "@tanstack/react-query";
import { parseTagsInput } from "@/lib/company/createCompanyBody";
import { updateCompanyDetails } from "@/lib/api";
import type { CompanyDetails } from "@/types/company";

export interface SaveCompanyDetailsArgs {
  company: CompanyDetails;
  name: string;
  descriptionEn: string;
  descriptionSv: string;
  lei: string;
  tagsInput: string;
  comment?: string;
  source?: string;
  onSave?: () => void;
}

function buildDescriptions(
  company: CompanyDetails,
  descriptionEn: string,
  descriptionSv: string,
): { id?: string; language: "SV" | "EN"; text: string }[] {
  const descriptions: { id?: string; language: "SV" | "EN"; text: string }[] =
    [];
  if (descriptionEn.trim()) {
    const item: { id?: string; language: "SV" | "EN"; text: string } = {
      language: "EN",
      text: descriptionEn.trim(),
    };
    const existing = company.descriptions?.find((d) => d.language === "EN");
    if (existing) item.id = existing.id;
    descriptions.push(item);
  }
  if (descriptionSv.trim()) {
    const item: { id?: string; language: "SV" | "EN"; text: string } = {
      language: "SV",
      text: descriptionSv.trim(),
    };
    const existing = company.descriptions?.find((d) => d.language === "SV");
    if (existing) item.id = existing.id;
    descriptions.push(item);
  }
  return descriptions;
}

async function saveCompanyDetails({
  company,
  name,
  descriptionEn,
  descriptionSv,
  lei,
  tagsInput,
  comment,
  source,
  onSave,
}: SaveCompanyDetailsArgs): Promise<void> {
  const metadata: { source?: string; comment?: string } = {};
  if (comment?.trim()) metadata.comment = comment.trim();
  if (source?.trim()) metadata.source = source.trim();

  const descriptions = buildDescriptions(company, descriptionEn, descriptionSv);
  const tags = parseTagsInput(tagsInput);

  await updateCompanyDetails(company.wikidataId, {
    wikidataId: company.wikidataId,
    name: name.trim(),
    ...(descriptions.length > 0 ? { descriptions } : undefined),
    ...(lei.trim() ? { lei: lei.trim() } : undefined),
    ...(tags.length > 0 ? { tags } : undefined),
    ...(Object.keys(metadata).length > 0 ? { metadata } : undefined),
  });

  if (onSave) {
    onSave();
  }
}

export function useCompanyDetailsSave() {
  const { mutate, isPending, error } = useMutation<
    void,
    Error,
    SaveCompanyDetailsArgs
  >({
    mutationFn: saveCompanyDetails,
  });

  return {
    saveCompanyDetails: mutate,
    isPending,
    error,
  };
}
