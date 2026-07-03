import { useTranslation } from "react-i18next";
import type {
  CompanyDetails as CompanyDetailsType,
  GicsOption,
} from "@/types/company";
import { CommentSourceBlock } from "./CommentSourceBlock";
import {
  BaseYearField,
  GicsSubIndustryField,
} from "./CompanyEditIndustryFields";

interface CompanyEditIndustrySectionProps {
  company: CompanyDetailsType;
  subIndustryCode: string;
  setSubIndustryCode: (value: string) => void;
  industryVerified: boolean;
  setIndustryVerified: (value: boolean) => void;
  baseYear: string;
  setBaseYear: (value: string) => void;
  baseYearVerified: boolean;
  setBaseYearVerified: (value: boolean) => void;
  industryComment: string;
  setIndustryComment: (value: string) => void;
  industrySource: string;
  setIndustrySource: (value: string) => void;
  gicsOptions: GicsOption[];
  gicsLoading: boolean;
  gicsError: string | null;
  industryIsDisabled: boolean;
  industryBadgeIconClass: string;
  baseYearIsDisabled: boolean;
  baseYearBadgeIconClass: string;
  industryLoading: boolean;
  onSave: () => void;
}

export function CompanyEditIndustrySection({
  company,
  subIndustryCode,
  setSubIndustryCode,
  industryVerified,
  setIndustryVerified,
  baseYear,
  setBaseYear,
  baseYearVerified,
  setBaseYearVerified,
  industryComment,
  setIndustryComment,
  industrySource,
  setIndustrySource,
  gicsOptions,
  gicsLoading,
  gicsError,
  industryIsDisabled,
  industryBadgeIconClass,
  baseYearIsDisabled,
  baseYearBadgeIconClass,
  industryLoading,
  onSave,
}: CompanyEditIndustrySectionProps) {
  const { t } = useTranslation();
  const originalBaseYear = String(company.baseYear?.year || "");

  return (
    <div className="overflow-x-auto overflow-y-visible mt-12">
      <div className="min-w-max">
        <div className="mb-8">
          <h3 className="mb-6 text-lg font-semibold">
            {t("companyEditPage.sections.industryAndBaseYear")}
          </h3>
          <GicsSubIndustryField
            company={company}
            subIndustryCode={subIndustryCode}
            setSubIndustryCode={setSubIndustryCode}
            industryVerified={industryVerified}
            setIndustryVerified={setIndustryVerified}
            gicsOptions={gicsOptions}
            gicsLoading={gicsLoading}
            gicsError={gicsError}
            industryIsDisabled={industryIsDisabled}
            industryBadgeIconClass={industryBadgeIconClass}
            industryLoading={industryLoading}
          />
          <BaseYearField
            baseYear={baseYear}
            setBaseYear={setBaseYear}
            baseYearVerified={baseYearVerified}
            setBaseYearVerified={setBaseYearVerified}
            originalBaseYear={originalBaseYear}
            baseYearIsDisabled={baseYearIsDisabled}
            baseYearBadgeIconClass={baseYearBadgeIconClass}
            industryLoading={industryLoading}
          />
        </div>

        <CommentSourceBlock
          comment={industryComment}
          source={industrySource}
          onCommentChange={setIndustryComment}
          onSourceChange={setIndustrySource}
          wrapperClassName="mt-10"
          commentPlaceholder={t("companyEditPage.placeholders.comment")}
          sourcePlaceholder={t("companyEditPage.placeholders.sourceUrl")}
        />
        <button
          type="button"
          onClick={onSave}
          disabled={industryLoading}
          className="inline-flex float-right mt-3 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none hover:opacity-80 active:ring-1 active:ring-white disabled:opacity-50 h-10 bg-blue-5 text-white rounded-lg hover:bg-blue-6 transition px-4 py-1 font-medium"
        >
          {industryLoading
            ? t("companyEditPage.save") + "..."
            : t("companyEditPage.saveIndustryAndBaseYear")}
        </button>
      </div>
    </div>
  );
}
