import { useTranslation } from "react-i18next";
import { useToast } from "@/contexts/ToastContext";
import type { CompanyDetails as CompanyDetailsType } from "@/types/company";
import { CompanyEditBasicDetailsSection } from "./CompanyEditBasicDetailsSection";
import { CompanyEditIndustrySection } from "./CompanyEditIndustrySection";
import { useCompanyEditDetailsState } from "./useCompanyEditDetailsState";

export function CompanyEditDetails({
  company,
  onSave,
}: {
  company: CompanyDetailsType;
  onSave?: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const state = useCompanyEditDetailsState(company);

  const showErrorToast = () => {
    showToast(
      t("companyEditPage.error.couldNotSave"),
      t("companyEditPage.error.tryAgainLater"),
    );
  };

  const handleSaveCompanyDetails = () => {
    state.setError(null);
    state.saveCompanyDetails(
      {
        company,
        name: state.name,
        descriptionEn: state.descriptionEn,
        descriptionSv: state.descriptionSv,
        lei: state.lei,
        logoUrl: state.logoUrl,
        tagsInput: state.tagsInput,
        comment: state.detailsComment,
        source: state.detailsSource,
        onSave,
      },
      {
        onError: (e) => {
          state.setError(e.message || "Failed to update company details");
          showErrorToast();
        },
        onSuccess: () => {
          state.setDetailsComment("");
          state.setDetailsSource("");
          showToast(
            t("companyEditPage.successDetails.title"),
            t("companyEditPage.successCompanyDetails.description"),
          );
        },
      },
    );
  };

  const handleSaveIndustryAndBaseYear = () => {
    state.setError(null);
    state.saveCompanyEditDetails(
      {
        company,
        subIndustryCode: state.subIndustryCode,
        baseYear: state.baseYear,
        comment: state.industryComment,
        source: state.industrySource,
        industryVerified: state.industryVerified,
        baseYearVerified: state.baseYearVerified,
        onSave,
      },
      {
        onError: (e) => {
          state.setError(e.message || "Failed to update");
          showErrorToast();
        },
        onSuccess: () => {
          state.setIndustryComment("");
          state.setIndustrySource("");
          showToast(
            t("companyEditPage.successDetails.title"),
            t("companyEditPage.successDetails.description"),
          );
        },
      },
    );
  };

  const displayError =
    state.error ||
    state.detailsMutationError?.message ||
    state.industryMutationError?.message;

  return (
    <div className="my-4">
      <CompanyEditBasicDetailsSection
        company={company}
        name={state.name}
        setName={state.setName}
        descriptionEn={state.descriptionEn}
        setDescriptionEn={state.setDescriptionEn}
        descriptionSv={state.descriptionSv}
        setDescriptionSv={state.setDescriptionSv}
        logoUrl={state.logoUrl}
        setLogoUrl={state.setLogoUrl}
        lei={state.lei}
        setLei={state.setLei}
        tagsInput={state.tagsInput}
        setTagsInput={state.setTagsInput}
        detailsComment={state.detailsComment}
        setDetailsComment={state.setDetailsComment}
        detailsSource={state.detailsSource}
        setDetailsSource={state.setDetailsSource}
        detailsLoading={state.detailsLoading}
        onSave={handleSaveCompanyDetails}
      />

      <CompanyEditIndustrySection
        company={company}
        subIndustryCode={state.subIndustryCode}
        setSubIndustryCode={state.setSubIndustryCode}
        industryVerified={state.industryVerified}
        setIndustryVerified={state.setIndustryVerified}
        baseYear={state.baseYear}
        setBaseYear={state.setBaseYear}
        baseYearVerified={state.baseYearVerified}
        setBaseYearVerified={state.setBaseYearVerified}
        industryComment={state.industryComment}
        setIndustryComment={state.setIndustryComment}
        industrySource={state.industrySource}
        setIndustrySource={state.setIndustrySource}
        gicsOptions={state.gicsOptions}
        gicsLoading={state.gicsLoading}
        gicsError={state.gicsError}
        industryIsDisabled={state.industryIsDisabled}
        industryBadgeIconClass={state.industryBadgeIconClass}
        baseYearIsDisabled={state.baseYearIsDisabled}
        baseYearBadgeIconClass={state.baseYearBadgeIconClass}
        industryLoading={state.industryLoading}
        onSave={handleSaveIndustryAndBaseYear}
      />

      {displayError && <div className="text-red-500 mt-4">{displayError}</div>}
    </div>
  );
}
