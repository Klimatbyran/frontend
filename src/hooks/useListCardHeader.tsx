import { useTranslation } from "react-i18next";
import { CompanyLogo } from "@/components/companies/CompanyLogo";

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
  const meetsParisAnswer =
    meetsParis === true
      ? t("yes")
      : meetsParis === false
        ? t("no")
        : t("companies.card.notEnoughData");
  const meetsParisTitle = t(meetsParisTranslationKey);

  const logo = logoUrl ? (
    isMunicipality || isRegion ? (
      <img src={logoUrl} alt="logo" className="h-[50px]" />
    ) : (
      <CompanyLogo
        src={logoUrl}
        className="shrink-0 rounded-xl size-[90px] object-contain hidden @lg:inline"
      />
    )
  ) : null;

  return {
    meetsParisAnswer,
    meetsParisTitle,
    logo,
    meetsParisIsYes: meetsParis === true,
  };
}
