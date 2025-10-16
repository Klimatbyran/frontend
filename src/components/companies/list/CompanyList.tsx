import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { CardGrid } from "@/components/CardGrid";
import { ListCard } from "@/components/layout/ListCard";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { processCompanyDataWithApiSlope } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import type { RankedCompany } from "@/types/company";
import type { SortOption } from "@/hooks/companies/useCompanySorting";

interface CompanyListProps {
  companies: RankedCompany[];
  searchQuery: string;
  sectors: string[];
  meetsParisFilter: "all" | "yes" | "no" | "unknown";
  sortBy: SortOption;
  sortDirection: "asc" | "desc";
}

export function CompanyList({
  companies,
  searchQuery,
  sectors,
  meetsParisFilter,
  sortBy,
  sortDirection,
}: CompanyListProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isEmissionsAIGenerated } = useVerificationStatus();

  // Transform company data for ListCard components
  const transformedCompanies = useMemo(() => {
    if (!companies) return [];

    return companies.map((company) => {
      const { wikidataId, name, descriptions, industry, reportingPeriods } =
        company;
      const isFinancialsSector = industry?.industryGics?.sectorCode === "40";
      const latestPeriod = reportingPeriods?.[0];
      const previousPeriod = reportingPeriods?.[1];

      const localizedDescription =
        descriptions?.find(
          (d: { language: "SV" | "EN"; text: string }) =>
            d.language ===
            (currentLanguage.toUpperCase() === "SV" ? "SV" : "EN"),
        )?.text ??
        descriptions?.[0]?.text ??
        "";

      const currentEmissions =
        latestPeriod?.emissions?.calculatedTotalEmissions || null;
      const previousEmissions =
        previousPeriod?.emissions?.calculatedTotalEmissions || null;
      const emissionsChange =
        currentEmissions && previousEmissions
          ? ((currentEmissions - previousEmissions) / previousEmissions) * 100
          : null;

      const noSustainabilityReport =
        !latestPeriod ||
        latestPeriod?.reportURL === null ||
        latestPeriod?.reportURL === "Saknar report" ||
        latestPeriod?.reportURL === undefined;

      const totalEmissionsAIGenerated = latestPeriod
        ? isEmissionsAIGenerated(latestPeriod)
        : false;
      const yearOverYearAIGenerated =
        (latestPeriod && isEmissionsAIGenerated(latestPeriod)) ||
        (previousPeriod && isEmissionsAIGenerated(previousPeriod));

      // Calculate trend analysis and meets Paris status
      const trendAnalysis = processCompanyDataWithApiSlope(company);
      const meetsParis = trendAnalysis
        ? calculateMeetsParis(company, trendAnalysis)
        : null; // null = unknown

      return {
        name,
        description: localizedDescription,
        linkTo: `/companies/${wikidataId}`,
        meetsParis,
        meetsParisTranslationKey: "companies.card.meetsParis",
        emissionsValue:
          currentEmissions != null
            ? formatEmissionsAbsolute(currentEmissions, currentLanguage)
            : null,
        emissionsYear: latestPeriod
          ? new Date(latestPeriod.endDate).getFullYear().toString()
          : undefined,
        emissionsUnit: t("emissionsUnit"),
        emissionsIsAIGenerated: totalEmissionsAIGenerated,
        changeRateValue: emissionsChange
          ? formatPercentChange(emissionsChange, currentLanguage)
          : null,
        changeRateColor: emissionsChange
          ? emissionsChange < 0
            ? "text-orange-2"
            : "text-pink-3"
          : undefined,
        changeRateIsAIGenerated: yearOverYearAIGenerated,
        changeRateTooltip:
          emissionsChange && (emissionsChange <= -80 || emissionsChange >= 80)
            ? `${t("companies.card.emissionsChangeRateInfo")}\n\n${t("companies.card.emissionsChangeRateInfoExtended")}`
            : t("companies.card.emissionsChangeRateInfo"),
        linkCardLink: latestPeriod?.reportURL
          ? latestPeriod.reportURL
          : undefined,
        linkCardTitle: t("companies.card.companyReport"),
        linkCardDescription: noSustainabilityReport
          ? t("companies.card.missingReport")
          : t("companies.card.reportYear", {
              year: new Date(latestPeriod.endDate).getFullYear(),
            }),
        linkCardDescriptionColor: noSustainabilityReport
          ? "text-pink-3"
          : "text-green-3",
        isFinancialsSector,
      };
    });
  }, [companies, t, currentLanguage, isEmissionsAIGenerated]);

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-light text-grey">
          {t("companiesPage.noCompaniesFound")}
        </h3>
        <p className="text-grey mt-2">
          {t("companiesPage.tryDifferentCriteria")}
        </p>
      </div>
    );
  }

  return (
    <CardGrid
      items={transformedCompanies}
      itemContent={(transformedData) => (
        <ListCard key={transformedData.linkTo} {...transformedData} />
      )}
    />
  );
}
