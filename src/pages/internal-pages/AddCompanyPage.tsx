import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "@/components/LocalizedLink";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCompanyDetails } from "@/lib/api";
import type { UpdateCompanyDetailsBody } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

export function AddCompanyPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [wikidataId, setWikidataId] = useState("");
  const [name, setName] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionSv, setDescriptionSv] = useState("");
  const [url, setUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [lei, setLei] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [internalComment, setInternalComment] = useState("");
  const [metadataComment, setMetadataComment] = useState("");
  const [metadataSource, setMetadataSource] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCompanyId, setCreatedCompanyId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const id = wikidataId.trim();
    if (!id) {
      setError(t("addCompanyPage.validation.wikidataIdRequired"));
      return;
    }
    if (!name.trim()) {
      setError(t("addCompanyPage.validation.nameRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const descriptions: { language: "SV" | "EN"; text: string }[] = [];
      if (descriptionEn.trim())
        descriptions.push({ language: "EN", text: descriptionEn.trim() });
      if (descriptionSv.trim())
        descriptions.push({ language: "SV", text: descriptionSv.trim() });

      const tags = tagsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const body: UpdateCompanyDetailsBody = {
        wikidataId: id,
        name: name.trim(),
        ...(descriptions.length > 0 ? { descriptions } : undefined),
        ...(url.trim() ? { url: url.trim() } : undefined),
        ...(logoUrl.trim() ? { logoUrl: logoUrl.trim() } : undefined),
        ...(lei.trim() ? { lei: lei.trim() } : undefined),
        ...(tags.length > 0 ? { tags } : undefined),
        ...(internalComment.trim() ? { internalComment: internalComment.trim() } : undefined),
        ...(metadataComment.trim() || metadataSource.trim()
          ? {
              metadata: {
                ...(metadataComment.trim() ? { comment: metadataComment.trim() } : undefined),
                ...(metadataSource.trim() ? { source: metadataSource.trim() } : undefined),
              },
            }
          : undefined),
      };

      await updateCompanyDetails(id, body);
      showToast(
        t("companyEditPage.successDetails.title"),
        t("addCompanyPage.success.description"),
      );
      setCreatedCompanyId(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create company";
      setError(message);
      showToast(
        t("companyEditPage.error.couldNotSave"),
        t("companyEditPage.error.tryAgainLater"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {createdCompanyId && (
        <div className="mb-6 rounded-lg bg-black-1 p-4 flex flex-wrap items-center gap-3">
          <span className="text-foreground">
            {t("addCompanyPage.success.description")}
          </span>
          <LocalizedLink
            to={`/companies/${createdCompanyId}/edit`}
            className="inline-flex items-center justify-center text-sm font-medium h-10 px-6 rounded-lg bg-blue-5 text-white hover:bg-blue-4"
          >
            {t("addCompanyPage.success.goToEdit")}
          </LocalizedLink>
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t("addCompanyPage.title")}
        </h1>
        <p className="text-grey">
          {t("addCompanyPage.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Required */}
        <section className="mb-8 rounded-lg bg-black-2 p-6">
          <h2 className="text-lg font-semibold mb-6 text-blue-3">
            {t("addCompanyPage.sections.required")}
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="wikidataId" className="block text-foreground">
                {t("addCompanyPage.fields.wikidataId")}
              </Label>
              <Input
                id="wikidataId"
                value={wikidataId}
                onChange={(e) => setWikidataId(e.target.value)}
                placeholder="Q12345"
                className="mt-1 w-full max-w-md bg-black-1 border text-foreground"
                required
              />
              <p className="text-sm text-grey mt-1">
                {t("addCompanyPage.help.wikidataId")}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="name" className="block text-foreground">
                {t("addCompanyPage.fields.name")}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("addCompanyPage.placeholders.name")}
                className="mt-1 w-full max-w-md bg-black-1 border text-foreground"
                required
              />
            </div>
          </div>
        </section>

        {/* Section 2: Descriptions */}
        <section className="mb-8 rounded-lg bg-black-2 p-6">
          <h2 className="text-lg font-semibold mb-6 text-blue-3">
            {t("addCompanyPage.sections.descriptions")}
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="descriptionEn" className="block text-foreground">
                {t("addCompanyPage.fields.descriptionEn")}
              </Label>
              <textarea
                id="descriptionEn"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                rows={3}
                className="mt-1 w-full max-w-xl p-2 rounded border text-foreground bg-black-1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="descriptionSv" className="block text-foreground">
                {t("addCompanyPage.fields.descriptionSv")}
              </Label>
              <textarea
                id="descriptionSv"
                value={descriptionSv}
                onChange={(e) => setDescriptionSv(e.target.value)}
                rows={3}
                className="mt-1 w-full max-w-xl p-2 rounded border text-foreground bg-black-1"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Links & media */}
        <section className="mb-8 rounded-lg bg-black-2 p-6">
          <h2 className="text-lg font-semibold mb-6 text-blue-3">
            {t("addCompanyPage.sections.linksAndMedia")}
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="url" className="block text-foreground">
                {t("addCompanyPage.fields.url")}
              </Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full max-w-xl bg-black-1 border text-foreground"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="logoUrl" className="block text-foreground">
                {t("addCompanyPage.fields.logoUrl")}
              </Label>
              <Input
                id="logoUrl"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full max-w-xl bg-black-1 border text-foreground"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Other */}
        <section className="mb-8 rounded-lg bg-black-2 p-6">
          <h2 className="text-lg font-semibold mb-6 text-blue-3">
            {t("addCompanyPage.sections.other")}
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="lei" className="block text-foreground">
                {t("addCompanyPage.fields.lei")}
              </Label>
              <Input
                id="lei"
                value={lei}
                onChange={(e) => setLei(e.target.value)}
                placeholder={t("addCompanyPage.placeholders.lei")}
                className="mt-1 w-full max-w-md bg-black-1 border text-foreground"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="tags" className="block text-foreground">
                {t("addCompanyPage.fields.tags")}
              </Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder={t("addCompanyPage.placeholders.tags")}
                className="mt-1 w-full max-w-xl bg-black-1 border text-foreground"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="internalComment" className="block text-foreground">
                {t("addCompanyPage.fields.internalComment")}
              </Label>
              <textarea
                id="internalComment"
                value={internalComment}
                onChange={(e) => setInternalComment(e.target.value)}
                rows={2}
                className="mt-1 w-full max-w-xl p-2 rounded border text-foreground bg-black-1"
                placeholder={t("addCompanyPage.placeholders.internalComment")}
              />
            </div>
          </div>
        </section>

        {/* Section 5: Metadata (audit) */}
        <section className="mb-8 rounded-lg bg-black-2 p-6">
          <h2 className="text-lg font-semibold mb-6 text-blue-3">
            {t("addCompanyPage.sections.metadata")}
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="metadataComment" className="block text-foreground">
                {t("addCompanyPage.fields.metadataComment")}
              </Label>
              <textarea
                id="metadataComment"
                value={metadataComment}
                onChange={(e) => setMetadataComment(e.target.value)}
                rows={2}
                className="mt-1 w-full max-w-xl p-2 rounded border text-foreground bg-black-1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="metadataSource" className="block text-foreground">
                {t("addCompanyPage.fields.metadataSource")}
              </Label>
              <Input
                id="metadataSource"
                type="url"
                value={metadataSource}
                onChange={(e) => setMetadataSource(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full max-w-xl bg-black-1 border text-foreground"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/20 p-4 text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center text-sm font-medium h-10 px-6 rounded-lg bg-blue-5 text-white hover:bg-blue-4 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting
              ? t("addCompanyPage.submitting")
              : t("addCompanyPage.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
