import { useState } from "react";
import type { CompanyDetails as CompanyDetailsType } from "@/types/company";
import { useGicsCodes } from "@/hooks/companies/useGicsCodes";
import { useCompanyEditDetailsSave } from "@/hooks/companies/useCompanyEditDetailsSave";
import { useCompanyDetailsSave } from "@/hooks/companies/useCompanyDetailsSave";
import { validateValue } from "../../../utils/ui/validation";
import {
  getBaseYearValidation,
  getGicsErrorMessage,
  getIndustryValidation,
  getInitialBasicDetailsState,
  getInitialIndustryState,
} from "./companyEditDetailsStateUtils";
import {
  useBaseYearVerificationSync,
  useIndustryVerificationSync,
} from "./useCompanyEditVerificationSync";

export function useCompanyEditDetailsState(company: CompanyDetailsType) {
  const initialBasic = getInitialBasicDetailsState(company);
  const initialIndustry = getInitialIndustryState(company);

  const [name, setName] = useState(initialBasic.name);
  const [descriptionEn, setDescriptionEn] = useState(
    initialBasic.descriptionEn,
  );
  const [descriptionSv, setDescriptionSv] = useState(
    initialBasic.descriptionSv,
  );
  const [logoUrl, setLogoUrl] = useState(initialBasic.logoUrl);
  const [lei, setLei] = useState(initialBasic.lei);
  const [tagsInput, setTagsInput] = useState("");
  const [detailsComment, setDetailsComment] = useState("");
  const [detailsSource, setDetailsSource] = useState("");

  const [subIndustryCode, setSubIndustryCode] = useState(
    initialIndustry.subIndustryCode,
  );
  const [industryVerified, setIndustryVerified] = useState(
    initialIndustry.industryVerified,
  );
  const [baseYear, setBaseYear] = useState(initialIndustry.baseYear);
  const [baseYearVerified, setBaseYearVerified] = useState(
    initialIndustry.baseYearVerified,
  );
  const [industryComment, setIndustryComment] = useState("");
  const [industrySource, setIndustrySource] = useState("");
  const [error, setError] = useState<string | null>(null);

  const gicsQuery = useGicsCodes();
  const detailsSave = useCompanyDetailsSave();
  const industrySave = useCompanyEditDetailsSave();

  useIndustryVerificationSync(company, subIndustryCode, setIndustryVerified);
  useBaseYearVerificationSync(company, baseYear, setBaseYearVerified);

  const industryValidation = getIndustryValidation(company);
  const baseYearValidation = getBaseYearValidation(company);

  const [industryIsDisabled, industryBadgeIconClass] = validateValue({
    value: subIndustryCode,
    originalValue: industryValidation.originalValue,
    originalVerified: industryValidation.originalVerified,
    verified: industryVerified,
  });
  const [baseYearIsDisabled, baseYearBadgeIconClass] = validateValue({
    value: String(baseYear),
    originalValue: baseYearValidation.originalValue,
    originalVerified: baseYearValidation.originalVerified,
    verified: baseYearVerified,
  });

  const gicsError = getGicsErrorMessage(gicsQuery.isError, gicsQuery.error);

  return {
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
    error,
    setError,
    gicsOptions: gicsQuery.data ?? [],
    gicsLoading: gicsQuery.isLoading,
    gicsError,
    detailsLoading: detailsSave.isPending,
    detailsMutationError: detailsSave.error,
    industryLoading: industrySave.isPending,
    industryMutationError: industrySave.error,
    saveCompanyDetails: detailsSave.saveCompanyDetails,
    saveCompanyEditDetails: industrySave.saveCompanyEditDetails,
    industryIsDisabled,
    industryBadgeIconClass,
    baseYearIsDisabled,
    baseYearBadgeIconClass,
  };
}
