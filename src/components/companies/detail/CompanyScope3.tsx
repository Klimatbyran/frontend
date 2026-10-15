import { useTranslation } from "react-i18next";
import type { PageCompanyScope3 } from "@/types/pages";
import { Scope3Data } from "./Scope3Data";
import { scope3EmissionsFromPage } from "@/utils/pages/companyDetailAdapters";

interface CompanyScope3Props {
  scope3: PageCompanyScope3 | undefined;
}

export function CompanyScope3({ scope3 }: CompanyScope3Props) {
  const { t } = useTranslation();

  if (!scope3?.categories.length) {
    return null;
  }

  const emissions = scope3EmissionsFromPage(scope3, t("emissionsUnit"));
  if (!emissions) return null;

  return <Scope3Data emissions={emissions} />;
}
