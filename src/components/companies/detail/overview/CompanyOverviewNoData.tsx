import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import type { CompanyDetails } from "@/types/company";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { getCompanySectorName } from "@/utils/data/industryGrouping";
import { useLanguage } from "@/components/LanguageProvider";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { getCompanyDescription } from "@/utils/business/company";
import { CompanyDescription } from "./CompanyDescription";
import { PageNoData } from "@/components/pageStates/NoData";
import { CompanyDetailHeader } from "../CompanyDetailHeader";
import {
  SupplementalDataField,
  SupplementalDataPanel,
} from "@/components/detail/SupplementalDataPanel";

interface CompanyOverviewNoDataProps {
  company: CompanyDetails;
  headerChip?: ReactNode;
}

export function CompanyOverviewNoData({
  company,
  headerChip,
}: CompanyOverviewNoDataProps) {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();
  const { currentLanguage } = useLanguage();

  const sectorName = getCompanySectorName(company, sectorNames);
  const description = getCompanyDescription(company, currentLanguage);

  return (
    <SectionWithHelp helpItems={["companySectors", "companyMissingData"]}>
      <div className="mb-4 space-y-4 md:mb-12">
        <CompanyDetailHeader
          name={company.name}
          logoUrl={company.logoUrl}
          headerChip={headerChip}
        />
        <CompanyDescription description={description} />
      </div>

      <SupplementalDataPanel>
        <SupplementalDataField label={t("companies.overview.sector")}>
          <Text>{sectorName}</Text>
        </SupplementalDataField>
      </SupplementalDataPanel>

      <div className="py-8">
        <PageNoData
          titleKey="companyDetailPage.noEmissionsDataTitle"
          descriptionKey="companyDetailPage.noEmissionsDataDescription"
        />
      </div>
    </SectionWithHelp>
  );
}
