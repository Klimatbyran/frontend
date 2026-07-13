import type { TFunction } from "i18next";
import type { ListCardProps } from "@/components/explore/ListCard";
import type {
  ComparisonCellValue,
  ComparisonMetric,
  ComparisonSection,
} from "./types";

export function getMeetsParisValue(
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

export function getClimatePlanStatus(
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

export function getDetailValue(
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

export function getClimatePlanAdopted(
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

export function createMeetsParisMetric(
  t: TFunction,
  labelKey: string,
): ComparisonMetric {
  return {
    id: "meetsParis",
    label: t(labelKey),
    getValue: getMeetsParisValue,
  };
}

export function createTotalEmissionsMetric(t: TFunction): ComparisonMetric {
  return {
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
  };
}

export function createChangeRateMetric(
  t: TFunction,
  labelKey: string,
): ComparisonMetric {
  return {
    id: "changeRate",
    label: t(labelKey),
    getValue: (item, translate) => ({
      text: item.changeRateValue ?? translate("companies.card.noData"),
      colorClass: item.changeRateColor ?? "text-orange-2",
      isAIGenerated: item.changeRateIsAIGenerated,
    }),
  };
}

export function createClimateTargetSection(
  t: TFunction,
  meetsParisLabelKey: string,
): ComparisonSection {
  return {
    id: "climateTarget",
    label: t("explorePage.comparison.sections.climateTarget"),
    metrics: [createMeetsParisMetric(t, meetsParisLabelKey)],
  };
}

export function createEmissionsSection(
  t: TFunction,
  changeRateLabelKey: string,
  extraMetrics: ComparisonMetric[] = [],
): ComparisonSection {
  return {
    id: "emissions",
    label: t("explorePage.comparison.sections.emissions"),
    metrics: [
      createTotalEmissionsMetric(t),
      createChangeRateMetric(t, changeRateLabelKey),
      ...extraMetrics,
    ],
  };
}

export function createScopeEmissionsMetric(
  t: TFunction,
  id: string,
  labelKey: string,
  detailKey: keyof NonNullable<ListCardProps["comparisonDetails"]>,
): ComparisonMetric {
  return {
    id,
    label: t(labelKey),
    getValue: (item, translate) =>
      getDetailValue(item, detailKey, translate("companies.card.noData"), {
        colorClass: "text-orange-2",
        unit: item.emissionsYear
          ? `${translate("emissionsUnit")} (${item.emissionsYear})`
          : translate("emissionsUnit"),
      }),
  };
}

export function createCompanyOverviewSection(t: TFunction): ComparisonSection {
  return {
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
  };
}

export function createCompanyReportingSection(t: TFunction): ComparisonSection {
  return {
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
  };
}

export function createSustainableTransportSection(
  t: TFunction,
): ComparisonSection {
  return {
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
                item.comparisonDetails?.electricCarsPerChargePointColorClass ??
                "text-white",
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
  };
}

export function createProcurementSection(t: TFunction): ComparisonSection {
  return {
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
  };
}

export function createPoliticsSection(t: TFunction): ComparisonSection {
  return {
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
  };
}

export function createClimatePlanSection(t: TFunction): ComparisonSection {
  return {
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
  };
}
