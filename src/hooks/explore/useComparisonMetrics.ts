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
    hasPlan === true
      ? t("yes")
      : hasPlan === false
        ? t("no")
        : t("unknown");
  const colorClass =
    hasPlan === true
      ? "text-green-3"
      : hasPlan === false
        ? "text-pink-3"
        : "text-grey";

  return { text, colorClass, displayAsBadge: true };
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
          label: t("municipalities.card.changeRate"),
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
            text: item.hasScope3Coverage
              ? translate("yes")
              : translate("no"),
            colorClass: item.hasScope3Coverage
              ? "text-green-3"
              : "text-pink-3",
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
