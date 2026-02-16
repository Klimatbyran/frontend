import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "@/components/LocalizedLink";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCompanyDetails } from "@/lib/api";
import {
  buildCreateCompanyBody,
  type CreateCompanyFormValues,
} from "@/lib/company/createCompanyBody";
import { useToast } from "@/contexts/ToastContext";
import { AddCompanySection } from "./AddCompanySection";

const FIELD_WRAPPER = "flex flex-col gap-1";
const LABEL_CLASS = "block text-foreground";
const INPUT_CLASS = "mt-1 w-full max-w-md bg-black-1 border text-foreground";
const INPUT_CLASS_XL = "mt-1 w-full max-w-xl bg-black-1 border text-foreground";
const TEXTAREA_CLASS =
  "mt-1 w-full max-w-xl p-2 rounded border text-foreground bg-black-1";

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
      const form: CreateCompanyFormValues = {
        wikidataId,
        name,
        descriptionEn,
        descriptionSv,
        url,
        logoUrl,
        lei,
        tagsInput,
        internalComment,
        metadataComment,
        metadataSource,
      };
      const body = buildCreateCompanyBody(form);
      await updateCompanyDetails(id, body);
      showToast(
        t("companyEditPage.successDetails.title"),
        t("addCompanyPage.success.description"),
      );
      setCreatedCompanyId(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create company";
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
        <p className="text-grey">{t("addCompanyPage.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <AddCompanySection titleKey="addCompanyPage.sections.required">
          <div className={FIELD_WRAPPER}>
            <Label htmlFor="wikidataId" className={LABEL_CLASS}>
              {t("addCompanyPage.fields.wikidataId")}
            </Label>
            <Input
              id="wikidataId"
              value={wikidataId}
              onChange={(e) => setWikidataId(e.target.value)}
              placeholder="Q12345"
              className={INPUT_CLASS}
              required
            />
            <p className="text-sm text-grey mt-1">
              {t("addCompanyPage.help.wikidataId")}
            </p>
          </div>
          <div className={FIELD_WRAPPER}>
            <Label htmlFor="name" className={LABEL_CLASS}>
              {t("addCompanyPage.fields.name")}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("addCompanyPage.placeholders.name")}
              className={INPUT_CLASS}
              required
            />
          </div>
        </AddCompanySection>

        <AddCompanySection titleKey="addCompanyPage.sections.descriptions">
          <div className={FIELD_WRAPPER}>
            <Label htmlFor="descriptionEn" className={LABEL_CLASS}>
              {t("addCompanyPage.fields.descriptionEn")}
            </Label>
            <textarea
              id="descriptionEn"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              rows={3}
              className={TEXTAREA_CLASS}
            />
          </div>
          <div className={FIELD_WRAPPER}>
            <Label htmlFor="descriptionSv" className={LABEL_CLASS}>
              {t("addCompanyPage.fields.descriptionSv")}
            </Label>
            <textarea
              id="descriptionSv"
              value={descriptionSv}
              onChange={(e) => setDescriptionSv(e.target.value)}
              rows={3}
              className={TEXTAREA_CLASS}
            />
          </div>
        </AddCompanySection>

        <AddCompanySection titleKey="addCompanyPage.sections.linksAndMedia">
          <div className={FIELD_WRAPPER}>
            <Label htmlFor="url" className={LABEL_CLASS}>
              {t("addCompanyPage.fields.url")}
            </Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className={INPUT_CLASS_XL}
            />
          </div>
          <div className={FIELD_WRAPPER}>
            <Label htmlFor="logoUrl" className={LABEL_CLASS}>
              {t("addCompanyPage.fields.logoUrl")}
            </Label>
            <Input
              id="logoUrl"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className={INPUT_CLASS_XL}
            />
          </div>
        </AddCompanySection>

        <AddCompanySection titleKey="addCompanyPage.sections.other">
          <div className={FIELD_WRAPPER}>
            <Label htmlFor="lei" className={LABEL_CLASS}>
              {t("addCompanyPage.fields.lei")}
            </Label>
            <Input
              id="lei"
              value={lei}
              onChange={(e) => setLei(e.target.value)}
              placeholder={t("addCompanyPage.placeholders.lei")}
              className={INPUT_CLASS}
            />
          </div>
          <div className={FIELD_WRAPPER}>
            <Label htmlFor="tags" className={LABEL_CLASS}>
              {t("addCompanyPage.fields.tags")}
            </Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t("addCompanyPage.placeholders.tags")}
              className={INPUT_CLASS_XL}
            />
          </div>
          <div className={FIELD_WRAPPER}>
            <Label htmlFor="internalComment" className={LABEL_CLASS}>
              {t("addCompanyPage.fields.internalComment")}
            </Label>
            <textarea
              id="internalComment"
              value={internalComment}
              onChange={(e) => setInternalComment(e.target.value)}
              rows={2}
              className={TEXTAREA_CLASS}
              placeholder={t("addCompanyPage.placeholders.internalComment")}
            />
          </div>
        </AddCompanySection>

        <AddCompanySection titleKey="addCompanyPage.sections.metadata">
          <div className={FIELD_WRAPPER}>
            <Label htmlFor="metadataComment" className={LABEL_CLASS}>
              {t("addCompanyPage.fields.metadataComment")}
            </Label>
            <textarea
              id="metadataComment"
              value={metadataComment}
              onChange={(e) => setMetadataComment(e.target.value)}
              rows={2}
              className={TEXTAREA_CLASS}
            />
          </div>
          <div className={FIELD_WRAPPER}>
            <Label htmlFor="metadataSource" className={LABEL_CLASS}>
              {t("addCompanyPage.fields.metadataSource")}
            </Label>
            <Input
              id="metadataSource"
              type="url"
              value={metadataSource}
              onChange={(e) => setMetadataSource(e.target.value)}
              placeholder="https://..."
              className={INPUT_CLASS_XL}
            />
          </div>
        </AddCompanySection>

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
