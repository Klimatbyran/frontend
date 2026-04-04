import { useTranslation } from "react-i18next";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { meetsParisAnswerLabel } from "@/components/explore/listCardHelpers";

export interface UseListCardHeaderParams {
  meetsParis: boolean | null;
  meetsParisTranslationKey: string;
  logoUrl?: string | null;
  isMunicipality: boolean;
  isRegion: boolean;
}

export function useListCardHeader({
  meetsParis,
  meetsParisTranslationKey,
  logoUrl,
  isMunicipality,
  isRegion,
}: UseListCardHeaderParams) {
  const { t } = useTranslation();
  const meetsParisAnswer = meetsParisAnswerLabel(meetsParis, t);
  const meetsParisTitle = t(meetsParisTranslationKey);

  const logo = logoUrl
    ? isMunicipality || isRegion ? (
        <img src={logoUrl} alt="logo" className="h-[50px]" />
      ) : (
        <CompanyLogo
          src={logoUrl}
          className="shrink-0 rounded-xl max-w-[90px] max-h-[90px] object-contain inline-block"
        />
      )
    : null;

  return {
    meetsParisAnswer,
    meetsParisTitle,
    logo,
    meetsParisIsYes: meetsParis === true,
  };
}
