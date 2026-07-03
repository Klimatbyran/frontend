import { useTranslation } from "react-i18next";
import type { CompanyDetails as CompanyDetailsType } from "@/types/company";
import { CompanyEditFieldWithUndo } from "./CompanyEditFieldWithUndo";
import { CommentSourceBlock } from "./CommentSourceBlock";
import { LogoDevDialog } from "./LogoDevDialog";
import { getDescriptionByLang } from "./companyEditDetailsUtils";

interface CompanyEditBasicDetailsSectionProps {
  company: CompanyDetailsType;
  name: string;
  setName: (value: string) => void;
  descriptionEn: string;
  setDescriptionEn: (value: string) => void;
  descriptionSv: string;
  setDescriptionSv: (value: string) => void;
  logoUrl: string;
  setLogoUrl: (value: string) => void;
  lei: string;
  setLei: (value: string) => void;
  tagsInput: string;
  setTagsInput: (value: string) => void;
  detailsComment: string;
  setDetailsComment: (value: string) => void;
  detailsSource: string;
  setDetailsSource: (value: string) => void;
  detailsLoading: boolean;
  onSave: () => void;
}

export function CompanyEditBasicDetailsSection({
  company,
  name,
  setName,
  descriptionEn,
  setDescriptionEn,
  descriptionSv,
  setDescriptionSv,
  logoUrl,
  setLogoUrl,
  lei,
  setLei,
  tagsInput,
  setTagsInput,
  detailsComment,
  setDetailsComment,
  detailsSource,
  setDetailsSource,
  detailsLoading,
  onSave,
}: CompanyEditBasicDetailsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto overflow-y-visible">
      <div className="min-w-max">
        <div className="mb-8">
          <h3 className="mb-6 text-lg font-semibold">
            {t("companyEditPage.tabs.companyDetails")}
          </h3>
          <CompanyEditFieldWithUndo
            label={t("companyEditPage.fields.name")}
            value={name}
            originalValue={company.name ?? ""}
            onChange={setName}
            onUndo={() => setName(company.name ?? "")}
            type="input"
            aria-label={t("companyEditPage.aria.undoName")}
          />
          <CompanyEditFieldWithUndo
            label={t("companyEditPage.fields.descriptionEn")}
            value={descriptionEn}
            originalValue={getDescriptionByLang(company, "EN")}
            onChange={setDescriptionEn}
            onUndo={() => setDescriptionEn(getDescriptionByLang(company, "EN"))}
            type="textarea"
            textareaRows={3}
            aria-label={t("companyEditPage.aria.undoDescriptionEn")}
          />
          <CompanyEditFieldWithUndo
            label={t("companyEditPage.fields.descriptionSv")}
            value={descriptionSv}
            originalValue={getDescriptionByLang(company, "SV")}
            onChange={setDescriptionSv}
            onUndo={() => setDescriptionSv(getDescriptionByLang(company, "SV"))}
            type="textarea"
            textareaRows={3}
            aria-label={t("companyEditPage.aria.undoDescriptionSv")}
          />
          <CompanyEditFieldWithUndo
            label={t("companyEditPage.fields.logoUrl")}
            value={logoUrl}
            originalValue={company.logoUrl ?? ""}
            onChange={setLogoUrl}
            onUndo={() => setLogoUrl(company.logoUrl ?? "")}
            type="input"
            aria-label={t("companyEditPage.aria.logoUrl")}
          >
            <LogoDevDialog
              className="ml-3 place-self-center h-10 inline-block bg-black-1 hover:bg-grey text-white px-6 py-2 rounded-lg transition-colors duration-200"
              logoUrl={logoUrl}
              setLogoUrl={setLogoUrl}
            />
          </CompanyEditFieldWithUndo>

          <CompanyEditFieldWithUndo
            label={t("companyEditPage.fields.lei")}
            value={lei}
            originalValue={company.lei ?? ""}
            onChange={setLei}
            onUndo={() => setLei(company.lei ?? "")}
            type="input"
            placeholder={t("companyEditPage.placeholders.lei")}
            aria-label={t("companyEditPage.aria.undoLei")}
          />
          <CompanyEditFieldWithUndo
            label={t("companyEditPage.fields.tags")}
            value={tagsInput}
            originalValue=""
            onChange={setTagsInput}
            onUndo={() => setTagsInput("")}
            type="input"
            placeholder={t("companyEditPage.placeholders.tags")}
            aria-label={t("companyEditPage.aria.undoTags")}
          />
        </div>

        <CommentSourceBlock
          comment={detailsComment}
          source={detailsSource}
          onCommentChange={setDetailsComment}
          onSourceChange={setDetailsSource}
          commentPlaceholder={t("companyEditPage.placeholders.comment")}
          sourcePlaceholder={t("companyEditPage.placeholders.sourceUrl")}
        />
        <button
          type="button"
          onClick={onSave}
          disabled={detailsLoading}
          className="inline-flex float-right mt-3 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none hover:opacity-80 active:ring-1 active:ring-white disabled:opacity-50 h-10 bg-blue-5 text-white rounded-lg hover:bg-blue-6 transition px-4 py-1 font-medium"
        >
          {detailsLoading
            ? t("companyEditPage.save") + "..."
            : t("companyEditPage.saveCompanyDetails")}
        </button>
      </div>
    </div>
  );
}
