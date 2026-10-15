import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import type { PageCompanyHeader } from "@/types/pages";
import {
  useIndustryGroupNames,
  useSectorNames,
} from "@/hooks/companies/useCompanySectors";
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
import {
  getCompanyIndustryGroupName,
  getCompanySectorName,
} from "@/utils/data/industryGrouping";

interface CompanyOverviewNoDataProps {
  header: PageCompanyHeader;
  headerChip?: ReactNode;
}

export function CompanyOverviewNoData({
  header,
  headerChip,
}: CompanyOverviewNoDataProps) {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();
  const industryGroupNames = useIndustryGroupNames();
  const { currentLanguage } = useLanguage();

  const notReported = t("companies.overview.notReported");
  const sectorName = getCompanySectorName(
    header.sectorCode,
    sectorNames,
    notReported,
  );
  const industryGroupName = getCompanyIndustryGroupName(
    header.industryGroupCode,
    industryGroupNames,
    notReported,
  );
  const description = getCompanyDescription(header, currentLanguage);

  return (
    <SectionWithHelp helpItems={["companySectors", "companyMissingData"]}>
      <div className="mb-4 space-y-4 md:mb-12">
        <CompanyDetailHeader
          name={header.name}
          logoUrl={header.logoUrl}
          headerChip={headerChip}
        />
        <CompanyDescription description={description} />
      </div>

      <SupplementalDataPanel>
        <SupplementalDataField label={t("companies.overview.sector")}>
          <Text>{sectorName}</Text>
        </SupplementalDataField>
        <SupplementalDataField label={t("companies.overview.industryGroup")}>
          <Text>{industryGroupName}</Text>
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
