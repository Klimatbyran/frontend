import type { UpdateCompanyDetailsBody } from "@/lib/api";

export function parseTagsInput(tagsInput: string): string[] {
  return tagsInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildDescriptionsForCreate(
  descriptionEn: string,
  descriptionSv: string,
): { language: "SV" | "EN"; text: string }[] {
  const descriptions: { language: "SV" | "EN"; text: string }[] = [];
  if (descriptionEn.trim())
    descriptions.push({ language: "EN", text: descriptionEn.trim() });
  if (descriptionSv.trim())
    descriptions.push({ language: "SV", text: descriptionSv.trim() });
  return descriptions;
}

export interface CreateCompanyFormValues {
  wikidataId: string;
  name: string;
  descriptionEn: string;
  descriptionSv: string;
  url: string;
  logoUrl: string;
  lei: string;
  tagsInput: string;
  internalComment: string;
  metadataComment: string;
  metadataSource: string;
}

export function buildCreateCompanyBody(
  form: CreateCompanyFormValues,
): UpdateCompanyDetailsBody {
  const id = form.wikidataId.trim();
  const descriptions = buildDescriptionsForCreate(
    form.descriptionEn,
    form.descriptionSv,
  );
  const tags = parseTagsInput(form.tagsInput);

  return {
    wikidataId: id,
    name: form.name.trim(),
    ...(descriptions.length > 0 ? { descriptions } : undefined),
    ...(form.url.trim() ? { url: form.url.trim() } : undefined),
    ...(form.logoUrl.trim() ? { logoUrl: form.logoUrl.trim() } : undefined),
    ...(form.lei.trim() ? { lei: form.lei.trim() } : undefined),
    ...(tags.length > 0 ? { tags } : undefined),
    ...(form.internalComment.trim()
      ? { internalComment: form.internalComment.trim() }
      : undefined),
    ...(form.metadataComment.trim() || form.metadataSource.trim()
      ? {
          metadata: {
            ...(form.metadataComment.trim()
              ? { comment: form.metadataComment.trim() }
              : undefined),
            ...(form.metadataSource.trim()
              ? { source: form.metadataSource.trim() }
              : undefined),
          },
        }
      : undefined),
  };
}
