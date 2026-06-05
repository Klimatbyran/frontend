import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { ListCardProps } from "@/components/explore/ListCard";

export type ComparisonCellValue = {
  text: string;
  colorClass?: string;
  unit?: string;
  isAIGenerated?: boolean;
  tooltip?: string;
  displayAsBadge?: boolean;
};

export type ComparisonMetric = {
  id: string;
  label: string;
  getValue: (item: ListCardProps, t: TFunction) => ComparisonCellValue;
};

export type ComparisonSection = {
  id: string;
  label: string;
  metrics: ComparisonMetric[];
};

function getMeetsParisValue(
  item: ListCardProps,
  t: TFunction,
): ComparisonCellValue {
  const text =
    item.meetsParis === true
      ? t("yes")
      : item.meetsParis === false
        ? t("no")
        : t("companies.card.notEnoughData");

  const colorClass =
    item.meetsParis === true
      ? "text-green-3"
      : item.meetsParis === false
        ? "text-pink-3"
        : "text-grey";

  return { text, colorClass, displayAsBadge: true };
}

function getClimatePlanStatus(
  item: ListCardProps,
  t: TFunction,
): ComparisonCellValue {
  const hasPlan = item.climatePlanHasPlan;
  const text =
    hasPlan === true ? t("yes") : hasPlan === false ? t("no") : t("unknown");
  const colorClass =
    hasPlan === true
      ? "text-green-3"
      : hasPlan === false
        ? "text-pink-3"
        : "text-grey";

  return { text, colorClass, displayAsBadge: true };
}

function getDetailValue(
  item: ListCardProps,
  key: keyof NonNullable<ListCardProps["comparisonDetails"]>,
  fallback: string,
  options?: Partial<ComparisonCellValue>,
): ComparisonCellValue {
  const value = item.comparisonDetails?.[key];
  return {
    text: value != null && value !== "" ? String(value) : fallback,
    ...options,
  };
}

function getClimatePlanAdopted(
  item: ListCardProps,
  t: TFunction,
): ComparisonCellValue {
  const hasPlan = item.climatePlanHasPlan;
  const text = hasPlan
    ? t("municipalities.card.adopted", {
        year: item.climatePlanYear ?? t("unknown"),
      })
    : t("municipalities.card.noPlan");

  const colorClass = !hasPlan ? "text-grey" : "text-white";

  return { text, colorClass };
}

function getMunicipalitySections(t: TFunction): ComparisonSection[] {
  return [
    {
      id: "climateTarget",
      label: t("explorePage.comparison.sections.climateTarget"),
      metrics: [
        {
          id: "meetsParis",
          label: t("municipalities.card.meetsParis"),
          getValue: getMeetsParisValue,
        },
      ],
    },
    {
      id: "emissions",
      label: t("explorePage.comparison.sections.emissions"),
      metrics: [
        {
          id: "totalEmissions",
          label: t("companies.card.emissions"),
          getValue: (item, translate) => ({
            text: item.emissionsValue ?? translate("companies.card.noData"),
            colorClass: "text-orange-2",
            unit: item.emissionsYear
              ? `${item.emissionsUnit ?? ""} (${item.emissionsYear})`.trim()
              : item.emissionsUnit,
            isAIGenerated: item.emissionsIsAIGenerated,
          }),
        },
        {
          id: "changeRate",
          label: t("municipalityDetailPage.annualChangeSince2015"),
          getValue: (item, translate) => ({
            text: item.changeRateValue ?? translate("companies.card.noData"),
            colorClass: item.changeRateColor ?? "text-orange-2",
            isAIGenerated: item.changeRateIsAIGenerated,
            tooltip: item.changeRateTooltip,
          }),
        },
        {
          id: "consumptionEmissions",
          label: t("municipalityDetailPage.consumptionEmissionsPerCapita"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "consumptionEmissionsPerCapita",
              translate("companies.card.noData"),
              {
                colorClass: "text-orange-2",
                unit: item.comparisonDetails?.consumptionEmissionsUnit,
              },
            ),
        },
      ],
    },
    {
      id: "sustainableTransport",
      label: t("explorePage.comparison.sections.sustainableTransport"),
      metrics: [
        {
          id: "electricCarChange",
          label: t("municipalityDetailPage.electricCarChange"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "electricCarChangePercent",
              translate("companies.card.noData"),
              { colorClass: "text-orange-2" },
            ),
        },
        {
          id: "electricCarsPerChargePoint",
          label: t("municipalityDetailPage.electricCarsPerChargePoint"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "electricCarsPerChargePoint",
              translate("companies.card.noData"),
              {
                colorClass:
                  item.comparisonDetails
                    ?.electricCarsPerChargePointColorClass ?? "text-white",
              },
            ),
        },
        {
          id: "bicycleMetrePerCapita",
          label: t("municipalityDetailPage.bicycleMetrePerCapita"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "bicycleMetrePerCapita",
              translate("companies.card.noData"),
              { colorClass: "text-orange-2" },
            ),
        },
      ],
    },
    {
      id: "procurement",
      label: t("explorePage.comparison.sections.procurement"),
      metrics: [
        {
          id: "procurementRequirements",
          label: t("municipalityDetailPage.procurementRequirements"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "procurementRequirements",
              translate("companies.card.noData"),
              {
                colorClass:
                  item.comparisonDetails?.procurementColorClass ?? "text-white",
              },
            ),
        },
      ],
    },
    {
      id: "politics",
      label: t("explorePage.comparison.sections.politics"),
      metrics: [
        {
          id: "politicalRule",
          label: t("municipalityDetailPage.politicalRule"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "politicalRule",
              translate("companies.card.noData"),
            ),
        },
        {
          id: "politicalKSO",
          label: t("municipalityDetailPage.politicalKSO"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "politicalKSO",
              translate("companies.card.noData"),
            ),
        },
      ],
    },
    {
      id: "climatePlan",
      label: t("explorePage.comparison.sections.climatePlan"),
      metrics: [
        {
          id: "hasClimatePlan",
          label: t("municipalities.card.climatePlan"),
          getValue: getClimatePlanStatus,
        },
        {
          id: "climatePlanAdopted",
          label: t("municipalities.card.climatePlanAdopted"),
          getValue: getClimatePlanAdopted,
        },
      ],
    },
  ];
}

function getCompanySections(t: TFunction): ComparisonSection[] {
  return [
    {
      id: "climateTarget",
      label: t("explorePage.comparison.sections.climateTarget"),
      metrics: [
        {
          id: "meetsParis",
          label: t("companies.card.meetsParis"),
          getValue: getMeetsParisValue,
        },
      ],
    },
    {
      id: "emissions",
      label: t("explorePage.comparison.sections.emissions"),
      metrics: [
        {
          id: "totalEmissions",
          label: t("companies.card.emissions"),
          getValue: (item, translate) => ({
            text: item.emissionsValue ?? translate("companies.card.noData"),
            colorClass: "text-orange-2",
            unit: item.emissionsYear
              ? `${item.emissionsUnit ?? ""} (${item.emissionsYear})`.trim()
              : item.emissionsUnit,
            isAIGenerated: item.emissionsIsAIGenerated,
          }),
        },
        {
          id: "changeRate",
          label: t("companies.card.emissionsChangeRate"),
          getValue: (item, translate) => ({
            text: item.changeRateValue ?? translate("companies.card.noData"),
            colorClass: item.changeRateColor ?? "text-orange-2",
            isAIGenerated: item.changeRateIsAIGenerated,
            tooltip: item.changeRateTooltip,
          }),
        },
        {
          id: "scope1",
          label: t("emissionsBreakdown.scope1"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "scope1Emissions",
              translate("companies.card.noData"),
              {
                colorClass: "text-orange-2",
                unit: item.emissionsYear
                  ? `${translate("emissionsUnit")} (${item.emissionsYear})`
                  : translate("emissionsUnit"),
              },
            ),
        },
        {
          id: "scope2",
          label: t("emissionsBreakdown.scope2"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "scope2Emissions",
              translate("companies.card.noData"),
              {
                colorClass: "text-orange-2",
                unit: item.emissionsYear
                  ? `${translate("emissionsUnit")} (${item.emissionsYear})`
                  : translate("emissionsUnit"),
              },
            ),
        },
        {
          id: "scope3",
          label: t("emissionsBreakdown.scope3"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "scope3Emissions",
              translate("companies.card.noData"),
              {
                colorClass: "text-orange-2",
                unit: item.emissionsYear
                  ? `${translate("emissionsUnit")} (${item.emissionsYear})`
                  : translate("emissionsUnit"),
              },
            ),
        },
      ],
    },
    {
      id: "companyOverview",
      label: t("explorePage.comparison.sections.companyOverview"),
      metrics: [
        {
          id: "turnover",
          label: t("companies.overview.turnover"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "turnover",
              translate("companies.overview.notReported"),
              {
                isAIGenerated: item.comparisonDetails?.turnoverIsAIGenerated,
              },
            ),
        },
        {
          id: "employees",
          label: t("companies.overview.employees"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "employees",
              translate("companies.overview.notReported"),
              {
                isAIGenerated: item.comparisonDetails?.employeesIsAIGenerated,
              },
            ),
        },
      ],
    },
    {
      id: "reporting",
      label: t("explorePage.comparison.sections.reporting"),
      metrics: [
        {
          id: "reportingSince",
          label: t("companies.card.reportingSince"),
          getValue: (item, translate) => ({
            text:
              item.baseYear != null
                ? String(item.baseYear)
                : translate("unknown"),
            colorClass: "text-white",
          }),
        },
        {
          id: "scope3Coverage",
          label: t("companies.card.scope3Coverage"),
          getValue: (item, translate) => ({
            text: item.hasScope3Coverage ? translate("yes") : translate("no"),
            colorClass: item.hasScope3Coverage ? "text-green-3" : "text-pink-3",
            displayAsBadge: true,
          }),
        },
      ],
    },
  ];
}

function getRegionSections(t: TFunction): ComparisonSection[] {
  return [
    {
      id: "climateTarget",
      label: t("explorePage.comparison.sections.climateTarget"),
      metrics: [
        {
          id: "meetsParis",
          label: t("municipalities.card.meetsParis"),
          getValue: getMeetsParisValue,
        },
      ],
    },
    {
      id: "emissions",
      label: t("explorePage.comparison.sections.emissions"),
      metrics: [
        {
          id: "totalEmissions",
          label: t("companies.card.emissions"),
          getValue: (item, translate) => ({
            text: item.emissionsValue ?? translate("companies.card.noData"),
            colorClass: "text-orange-2",
            unit: item.emissionsYear
              ? `${item.emissionsUnit ?? ""} (${item.emissionsYear})`.trim()
              : item.emissionsUnit,
            isAIGenerated: item.emissionsIsAIGenerated,
          }),
        },
        {
          id: "changeRate",
          label: t("explorePage.regions.changeRateLabel"),
          getValue: (item, translate) => ({
            text: item.changeRateValue ?? translate("companies.card.noData"),
            colorClass: item.changeRateColor ?? "text-orange-2",
            isAIGenerated: item.changeRateIsAIGenerated,
            tooltip: item.changeRateTooltip,
          }),
        },
      ],
    },
    {
      id: "overview",
      label: t("explorePage.comparison.sections.overview"),
      metrics: [
        {
          id: "municipalityCount",
          label: t("explorePage.comparison.metrics.municipalityCount"),
          getValue: (item, translate) =>
            getDetailValue(
              item,
              "municipalityCount",
              translate("companies.card.noData"),
            ),
        },
      ],
    },
  ];
}

export function getComparisonSections(
  variant: ListCardProps["variant"],
  t: TFunction,
): ComparisonSection[] {
  switch (variant) {
    case "municipality":
      return getMunicipalitySections(t);
    case "region":
      return getRegionSections(t);
    case "company":
    default:
      return getCompanySections(t);
  }
}

export function useComparisonSections(items: ListCardProps[]) {
  const { t } = useTranslation();

  return useMemo(() => {
    if (items.length === 0) {
      return [];
    }
    return getComparisonSections(items[0].variant, t);
  }, [items, t]);
}
