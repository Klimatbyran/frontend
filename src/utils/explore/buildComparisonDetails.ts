import type { TFunction } from "i18next";
import type { ListCardProps } from "@/components/explore/ListCard";
import type { RankedCompany } from "@/types/company";
import type { Municipality } from "@/types/municipality";
import type { RegionForExplore } from "@/hooks/regions/useRegionsForExplore";
import { getProcurementRequirementsText } from "@/utils/municipality/procurement";
import {
  formatEmployeeCount,
  formatEmissionsAbsolute,
  formatPercent,
  localizeUnit,
  type SupportedLanguage,
} from "@/utils/formatting/localization";
import { getEntityDetailPath } from "@/utils/routing";

export type ComparisonDetails = {
  consumptionEmissionsPerCapita?: string | null;
  consumptionEmissionsUnit?: string;
  electricCarChangePercent?: string | null;
  electricCarsPerChargePoint?: string | null;
  electricCarsPerChargePointColorClass?: string;
  bicycleMetrePerCapita?: string | null;
  procurementRequirements?: string | null;
  procurementColorClass?: string;
  politicalRule?: string | null;
  politicalKSO?: string | null;
  turnover?: string | null;
  turnoverIsAIGenerated?: boolean;
  employees?: string | null;
  employeesIsAIGenerated?: boolean;
  scope1Emissions?: string | null;
  scope2Emissions?: string | null;
  scope3Emissions?: string | null;
  municipalityCount?: string | null;
};

function formatTurnover(
  period: RankedCompany["reportingPeriods"][number],
  currentLanguage: SupportedLanguage,
  t: TFunction,
): string | null {
  const turnover = period.economy?.turnover;
  if (!turnover?.value) {
    return null;
  }

  const useMillions = turnover.value < 1e9;
  return `${localizeUnit(
    turnover.value / (useMillions ? 1e6 : 1e9),
    currentLanguage,
  )} ${t(useMillions ? "companies.overview.million" : "companies.overview.billion")} ${turnover.currency}`;
}

export function buildMunicipalityComparisonDetails(
  municipality: Municipality,
  currentLanguage: SupportedLanguage,
  t: TFunction,
): ComparisonDetails {
  const evcp = municipality.electricVehiclePerChargePoints;

  return {
    consumptionEmissionsPerCapita: localizeUnit(
      municipality.totalConsumptionEmission,
      currentLanguage,
    ),
    consumptionEmissionsUnit: t("emissionsUnit"),
    electricCarChangePercent: formatPercent(
      municipality.electricCarChangePercent,
      currentLanguage,
      true,
    ),
    electricCarsPerChargePoint: evcp
      ? localizeUnit(evcp, currentLanguage)
      : t("municipalityDetailPage.noChargePoints"),
    electricCarsPerChargePointColorClass:
      evcp && evcp > 10 ? "text-pink-3" : "text-green-3",
    bicycleMetrePerCapita: localizeUnit(
      municipality.bicycleMetrePerCapita,
      currentLanguage,
    ),
    procurementRequirements: getProcurementRequirementsText(
      municipality.procurementScore,
      t,
    ),
    procurementColorClass:
      municipality.procurementScore === 2
        ? "text-green-3"
        : municipality.procurementScore === 1
          ? "text-orange-2"
          : "text-pink-3",
    politicalRule:
      municipality.politicalRule.length > 0
        ? municipality.politicalRule.join(", ")
        : null,
    politicalKSO: municipality.politicalKSO || null,
  };
}

type IsAIGeneratedFn = <T extends { metadata?: unknown }>(
  data: T | undefined | null,
) => boolean;

export function buildCompanyComparisonDetails(
  company: RankedCompany,
  currentLanguage: SupportedLanguage,
  t: TFunction,
  isAIGenerated: IsAIGeneratedFn,
): ComparisonDetails {
  const latestPeriod = company.reportingPeriods?.[0];
  if (!latestPeriod) {
    return {};
  }

  const emissions = latestPeriod.emissions;
  const scope1 = emissions?.scope1?.total;
  const scope2 = emissions?.scope2?.calculatedTotalEmissions;
  const scope3 =
    emissions?.scope3?.calculatedTotalEmissions ??
    emissions?.scope3?.statedTotalEmissions?.total;

  return {
    turnover: formatTurnover(latestPeriod, currentLanguage, t),
    turnoverIsAIGenerated: isAIGenerated(latestPeriod.economy?.turnover),
    employees: latestPeriod.economy?.employees?.value
      ? formatEmployeeCount(
          latestPeriod.economy.employees.value,
          currentLanguage,
        )
      : null,
    employeesIsAIGenerated: isAIGenerated(latestPeriod.economy?.employees),
    scope1Emissions:
      scope1 != null
        ? formatEmissionsAbsolute(scope1, currentLanguage)
        : null,
    scope2Emissions:
      scope2 != null
        ? formatEmissionsAbsolute(scope2, currentLanguage)
        : null,
    scope3Emissions:
      scope3 != null
        ? formatEmissionsAbsolute(scope3, currentLanguage)
        : null,
  };
}

export function buildRegionComparisonDetails(
  region: RegionForExplore,
  t: TFunction,
): ComparisonDetails {
  return {
    municipalityCount: t("explorePage.regions.municipalityCount", {
      count: region.municipalityCount,
    }),
  };
}

export function enrichComparisonItem(
  card: ListCardProps,
  options: {
    municipality?: Municipality;
    company?: RankedCompany;
    region?: RegionForExplore;
    currentLanguage: SupportedLanguage;
    t: TFunction;
    isAIGenerated?: IsAIGeneratedFn;
  },
): ListCardProps {
  const { municipality, company, region, currentLanguage, t, isAIGenerated } =
    options;

  if (card.variant === "municipality" && municipality) {
    return {
      ...card,
      comparisonDetails: buildMunicipalityComparisonDetails(
        municipality,
        currentLanguage,
        t,
      ),
    };
  }

  if (card.variant === "company" && company && isAIGenerated) {
    return {
      ...card,
      comparisonDetails: buildCompanyComparisonDetails(
        company,
        currentLanguage,
        t,
        isAIGenerated,
      ),
    };
  }

  if (card.variant === "region" && region) {
    return {
      ...card,
      comparisonDetails: buildRegionComparisonDetails(region, t),
    };
  }

  return card;
}

export function getMunicipalityLinkTo(name: string): string {
  return `/municipalities/${name}`;
}

export function getCompanyLinkTo(wikidataId: string): string {
  return `/companies/${wikidataId}`;
}

export function getRegionLinkTo(name: string): string {
  return getEntityDetailPath("region", name);
}
