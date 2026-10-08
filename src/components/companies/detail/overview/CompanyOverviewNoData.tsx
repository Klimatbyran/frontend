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
import type { IndustryGroupCode } from "@/lib/constants/sectors";

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

  const sectorName = header.sectorCode
    ? (sectorNames[header.sectorCode] ?? header.sectorCode)
    : t("companies.overview.notReported");
  const industryGroupName = header.industryGroupCode
    ? (industryGroupNames[header.industryGroupCode as IndustryGroupCode] ??
      header.industryGroupCode)
    : t("companies.overview.notReported");
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
