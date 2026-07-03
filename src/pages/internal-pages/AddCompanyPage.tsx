import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "@/components/LocalizedLink";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCompany } from "@/lib/api";
import { getCompanyUrlSegment } from "@/utils/companyRouting";
import {
  buildCreateCompanyBody,
  type CreateCompanyFormValues,
} from "@/lib/company/createCompanyBody";
import { useToast } from "@/contexts/ToastContext";
import { AddCompanySection } from "./AddCompanySection";
import { LogoDevDialog } from "@/components/companies/edit/LogoDevDialog";

const FIELD_WRAPPER = "flex flex-col gap-1";
const LABEL_CLASS = "block text-foreground";
const INPUT_CLASS = "mt-1 w-full max-w-md bg-black-1 border text-foreground";
const INPUT_CLASS_XL = "mt-1 w-full max-w-xl bg-black-1 border text-foreground";
const TEXTAREA_CLASS =
  "mt-1 w-full max-w-xl p-2 rounded border text-foreground bg-black-1";

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  rows?: number;
  multiline?: boolean;
  helpText?: string;
}

function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  rows,
  multiline,
  helpText,
}: FormFieldProps) {
  const inputClass = multiline ? TEXTAREA_CLASS : INPUT_CLASS;
  return (
    <div className={FIELD_WRAPPER}>
      <Label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </Label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={TEXTAREA_CLASS}
          placeholder={placeholder}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
          required={required}
        />
      )}
      {helpText && <p className="text-sm text-grey mt-1">{helpText}</p>}
    </div>
  );
}

function RequiredFieldsSection({
  wikidataId,
  name,
  setWikidataId,
  setName,
  t,
}: {
  wikidataId: string;
  name: string;
  setWikidataId: (v: string) => void;
  setName: (v: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <AddCompanySection titleKey="addCompanyPage.sections.required">
      <FormField
        id="wikidataId"
        label={t("addCompanyPage.fields.wikidataId")}
        value={wikidataId}
        onChange={setWikidataId}
        placeholder="Q12345"
        required
        helpText={t("addCompanyPage.help.wikidataId")}
      />
      <FormField
        id="name"
        label={t("addCompanyPage.fields.name")}
        value={name}
        onChange={setName}
        placeholder={t("addCompanyPage.placeholders.name")}
        required
      />
    </AddCompanySection>
  );
}

function DescriptionsSection({
  descriptionEn,
  descriptionSv,
  setDescriptionEn,
  setDescriptionSv,
  t,
}: {
  descriptionEn: string;
  descriptionSv: string;
  setDescriptionEn: (v: string) => void;
  setDescriptionSv: (v: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <AddCompanySection titleKey="addCompanyPage.sections.descriptions">
      <FormField
        id="descriptionEn"
        label={t("addCompanyPage.fields.descriptionEn")}
        value={descriptionEn}
        onChange={setDescriptionEn}
        multiline
        rows={3}
      />
      <FormField
        id="descriptionSv"
        label={t("addCompanyPage.fields.descriptionSv")}
        value={descriptionSv}
        onChange={setDescriptionSv}
        multiline
        rows={3}
      />
    </AddCompanySection>
  );
}

function LinksAndMediaSection({
  url,
  logoUrl,
  setUrl,
  setLogoUrl,
  t,
}: {
  url: string;
  logoUrl: string;
  setUrl: (v: string) => void;
  setLogoUrl: (v: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <AddCompanySection titleKey="addCompanyPage.sections.linksAndMedia">
      <FormField
        id="url"
        label={t("addCompanyPage.fields.url")}
        value={url}
        onChange={setUrl}
        type="url"
        placeholder="https://..."
      />
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
        <div className="w-full max-w-xl flex flex-col">
          <LogoDevDialog
            className="mt-2 place-self-end h-10 inline-block bg-black-1 hover:bg-grey text-white px-6 py-2 rounded-lg transition-colors duration-200"
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
          />
        </div>
      </div>
    </AddCompanySection>
  );
}

function OtherFieldsSection({
  lei,
  tagsInput,
  internalComment,
  setLei,
  setTagsInput,
  setInternalComment,
  t,
}: {
  lei: string;
  tagsInput: string;
  internalComment: string;
  setLei: (v: string) => void;
  setTagsInput: (v: string) => void;
  setInternalComment: (v: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <AddCompanySection titleKey="addCompanyPage.sections.other">
      <FormField
        id="lei"
        label={t("addCompanyPage.fields.lei")}
        value={lei}
        onChange={setLei}
        placeholder={t("addCompanyPage.placeholders.lei")}
      />
      <FormField
        id="tags"
        label={t("addCompanyPage.fields.tags")}
        value={tagsInput}
        onChange={setTagsInput}
        placeholder={t("addCompanyPage.placeholders.tags")}
      />
      <FormField
        id="internalComment"
        label={t("addCompanyPage.fields.internalComment")}
        value={internalComment}
        onChange={setInternalComment}
        multiline
        rows={2}
        placeholder={t("addCompanyPage.placeholders.internalComment")}
      />
    </AddCompanySection>
  );
}

function MetadataSection({
  metadataComment,
  metadataSource,
  setMetadataComment,
  setMetadataSource,
  t,
}: {
  metadataComment: string;
  metadataSource: string;
  setMetadataComment: (v: string) => void;
  setMetadataSource: (v: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <AddCompanySection titleKey="addCompanyPage.sections.metadata">
      <FormField
        id="metadataComment"
        label={t("addCompanyPage.fields.metadataComment")}
        value={metadataComment}
        onChange={setMetadataComment}
        multiline
        rows={2}
      />
      <FormField
        id="metadataSource"
        label={t("addCompanyPage.fields.metadataSource")}
        value={metadataSource}
        onChange={setMetadataSource}
        type="url"
        placeholder="https://..."
      />
    </AddCompanySection>
  );
}

function useAddCompanyForm() {
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
      const result = await createCompany(buildCreateCompanyBody(form));
      showToast(
        t("companyEditPage.successDetails.title"),
        t("addCompanyPage.success.description"),
      );
      setCreatedCompanyId(
        getCompanyUrlSegment({ id: result.id, wikidataId: id || undefined }),
      );
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

  return {
    t,
    fields: {
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
    },
    setters: {
      setWikidataId,
      setName,
      setDescriptionEn,
      setDescriptionSv,
      setUrl,
      setLogoUrl,
      setLei,
      setTagsInput,
      setInternalComment,
      setMetadataComment,
      setMetadataSource,
    },
    isSubmitting,
    error,
    createdCompanyId,
    handleSubmit,
  };
}

export function AddCompanyPage() {
  const { t, fields, setters, isSubmitting, error, createdCompanyId, handleSubmit } =
    useAddCompanyForm();

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
        <RequiredFieldsSection
          wikidataId={fields.wikidataId}
          name={fields.name}
          setWikidataId={setters.setWikidataId}
          setName={setters.setName}
          t={t}
        />
        <DescriptionsSection
          descriptionEn={fields.descriptionEn}
          descriptionSv={fields.descriptionSv}
          setDescriptionEn={setters.setDescriptionEn}
          setDescriptionSv={setters.setDescriptionSv}
          t={t}
        />
        <LinksAndMediaSection
          url={fields.url}
          logoUrl={fields.logoUrl}
          setUrl={setters.setUrl}
          setLogoUrl={setters.setLogoUrl}
          t={t}
        />
        <OtherFieldsSection
          lei={fields.lei}
          tagsInput={fields.tagsInput}
          internalComment={fields.internalComment}
          setLei={setters.setLei}
          setTagsInput={setters.setTagsInput}
          setInternalComment={setters.setInternalComment}
          t={t}
        />
        <MetadataSection
          metadataComment={fields.metadataComment}
          metadataSource={fields.metadataSource}
          setMetadataComment={setters.setMetadataComment}
          setMetadataSource={setters.setMetadataSource}
          t={t}
        />

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
