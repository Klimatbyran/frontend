import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMunicipalityKPIs } from "@/hooks/municipalities/useMunicipalityKPIs";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { useRegionsKPIs } from "@/hooks/regions/useRegionKPIs";
import { useNationDetails } from "@/hooks/nation/useNationDetails";
import type {
  BenchmarkMetricDefinition,
  BenchmarkReference,
  TerritoryBenchmarkData,
  TerritoryBenchmarkEntityType,
} from "@/types/territoryBenchmarks";
import {
  buildDistributionItems,
  computeAverage,
  computePercentile,
  computeRank,
  extractNumericValues,
} from "@/utils/territories/benchmarkUtils";
import { normalizeMunicipalityKpiApiItem } from "@/utils/territoryMapData";
import type { Municipality } from "@/types/municipality";

type MunicipalityKpiItem = ReturnType<
  typeof normalizeMunicipalityKpiApiItem<
    Awaited<
      ReturnType<
        typeof import("@/hooks/municipalities/useMunicipalityKPIs").useMunicipalityKPIs
      >["municipalitiesData"]
    >[number]
  >
>;

interface UseTerritoryBenchmarksOptions {
  entityType: TerritoryBenchmarkEntityType;
  entityId: string;
  entityName: string;
  regionName?: string;
  entityValueOverrides?: Partial<Record<string, number | null>>;
}

function getMunicipalityMetricDefinitions(
  t: ReturnType<typeof useTranslation>["t"],
): BenchmarkMetricDefinition[] {
  return [
    {
      key: "historicalEmissionChangePercent",
      label: t("detailPage.changeSince2015"),
      unit: "%",
      higherIsBetter: false,
      description: t(
        "municipalities.list.kpis.historicalEmissionChangePercent.description",
      ),
    },
    {
      key: "totalConsumptionEmission",
      label: t("municipalityDetailPage.consumptionEmissionsPerCapita"),
      unit: t("emissionsUnit"),
      higherIsBetter: false,
      description: t(
        "municipalities.list.kpis.totalConsumptionEmission.description",
      ),
    },
    {
      key: "electricCarChangePercent",
      label: t("municipalityDetailPage.electricCarChange"),
      unit: "%",
      higherIsBetter: true,
      description: t(
        "municipalities.list.kpis.electricCarChangePercent.description",
      ),
    },
    {
      key: "bicycleMetrePerCapita",
      label: t("municipalityDetailPage.bicycleMetrePerCapita"),
      unit: "m",
      higherIsBetter: true,
      description: t(
        "municipalities.list.kpis.bicycleMetrePerCapita.description",
      ),
    },
  ];
}

function getRegionNationMetricDefinitions(
  t: ReturnType<typeof useTranslation>["t"],
): BenchmarkMetricDefinition[] {
  return [
    {
      key: "historicalEmissionChangePercent",
      label: t("detailPage.changeSince2015"),
      unit: "%",
      higherIsBetter: false,
      description: t(
        "regions.list.kpis.historicalEmissionChangePercent.description",
      ),
    },
  ];
}

function getMetricValue<T extends Record<string, unknown>>(
  item: T | null | undefined,
  key: string,
  overrides?: Partial<Record<string, number | null>>,
): number | null {
  const override = overrides?.[key];
  if (override !== undefined) return override;
  if (!item) return null;
  const value = item[key];
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return value;
}

function buildMunicipalityBenchmarkData(
  metric: BenchmarkMetricDefinition,
  entityId: string,
  regionName: string | undefined,
  municipalities: MunicipalityKpiItem[],
  overrides?: Partial<Record<string, number | null>>,
): TerritoryBenchmarkData {
  const current = municipalities.find((item) => item.name === entityId);
  const entityValue = getMetricValue(current, metric.key, overrides);

  const peerValues = extractNumericValues(municipalities, (item) =>
    getMetricValue(item, metric.key),
  );
  const regionalPeers = regionName
    ? municipalities.filter((item) => item.region === regionName)
    : [];
  const regionalValues = extractNumericValues(regionalPeers, (item) =>
    getMetricValue(item, metric.key),
  );

  const peerAverage = computeAverage(peerValues);
  const regionalAverage = computeAverage(regionalValues);
  const rank =
    entityValue !== null
      ? computeRank(entityValue, peerValues, metric.higherIsBetter)
      : null;
  const percentile =
    rank !== null ? computePercentile(rank, peerValues.length) : null;
  const diffFromPeerAverage =
    entityValue !== null && peerAverage !== null
      ? entityValue - peerAverage
      : null;

  const references: BenchmarkReference[] = [
    {
      id: "entity",
      label: current?.name ?? entityId,
      value: entityValue,
      colorClass: "bg-orange-2",
      isHighlighted: true,
    },
    {
      id: "regional",
      label: regionName ?? "",
      value: regionalAverage,
      colorClass: "bg-blue-3",
    },
    {
      id: "national",
      label: "",
      value: peerAverage,
      colorClass: "bg-green-3",
    },
  ].filter((reference) => reference.id !== "regional" || !!regionName);

  return {
    metric,
    entityValue,
    references,
    distribution: buildDistributionItems(
      municipalities,
      (item) => item.name,
      (item) => item.name,
      (item) => getMetricValue(item, metric.key),
      entityId,
    ),
    rank,
    totalPeers: peerValues.length,
    percentile,
    diffFromPeerAverage,
    peerAverage,
    loading: false,
  };
}

function buildRegionBenchmarkData(
  metric: BenchmarkMetricDefinition,
  entityId: string,
  regions: Array<{
    name: string;
    historicalEmissionChangePercent: number | null;
  }>,
  nationValue: number | null,
  overrides?: Partial<Record<string, number | null>>,
): TerritoryBenchmarkData {
  const current = regions.find((item) => item.name === entityId);
  const entityValue = getMetricValue(current, metric.key, overrides);

  const peerValues = extractNumericValues(regions, (item) =>
    getMetricValue(item, metric.key),
  );
  const peerAverage = computeAverage(peerValues);
  const rank =
    entityValue !== null
      ? computeRank(entityValue, peerValues, metric.higherIsBetter)
      : null;
  const percentile =
    rank !== null ? computePercentile(rank, peerValues.length) : null;
  const diffFromPeerAverage =
    entityValue !== null && peerAverage !== null
      ? entityValue - peerAverage
      : null;

  const references: BenchmarkReference[] = [
    {
      id: "entity",
      label: current?.name ?? entityId,
      value: entityValue,
      colorClass: "bg-orange-2",
      isHighlighted: true,
    },
    {
      id: "national",
      label: "",
      value: nationValue ?? peerAverage,
      colorClass: "bg-green-3",
    },
  ];

  return {
    metric,
    entityValue,
    references,
    distribution: buildDistributionItems(
      regions,
      (item) => item.name,
      (item) => item.name,
      (item) => getMetricValue(item, metric.key),
      entityId,
    ),
    rank,
    totalPeers: peerValues.length,
    percentile,
    diffFromPeerAverage,
    peerAverage,
    loading: false,
  };
}

function buildNationBenchmarkData(
  metric: BenchmarkMetricDefinition,
  entityValue: number | null,
  regions: Array<{
    name: string;
    historicalEmissionChangePercent: number | null;
  }>,
): TerritoryBenchmarkData {
  const peerValues = extractNumericValues(regions, (item) =>
    getMetricValue(item, metric.key),
  );
  const peerAverage = computeAverage(peerValues);
  const rank =
    entityValue !== null
      ? computeRank(entityValue, peerValues, metric.higherIsBetter)
      : null;
  const percentile =
    rank !== null ? computePercentile(rank, peerValues.length) : null;
  const diffFromPeerAverage =
    entityValue !== null && peerAverage !== null
      ? entityValue - peerAverage
      : null;

  const references: BenchmarkReference[] = [
    {
      id: "entity",
      label: "",
      value: entityValue,
      colorClass: "bg-orange-2",
      isHighlighted: true,
    },
    {
      id: "regional-average",
      label: "",
      value: peerAverage,
      colorClass: "bg-blue-3",
    },
  ];

  return {
    metric,
    entityValue,
    references,
    distribution: buildDistributionItems(
      regions,
      (item) => item.name,
      (item) => item.name,
      (item) => getMetricValue(item, metric.key),
      "__nation__",
    ),
    rank,
    totalPeers: peerValues.length,
    percentile,
    diffFromPeerAverage,
    peerAverage,
    loading: false,
  };
}

export function useTerritoryBenchmarks({
  entityType,
  entityId,
  entityName,
  regionName,
  entityValueOverrides,
}: UseTerritoryBenchmarksOptions) {
  const { t } = useTranslation();
  const { municipalitiesData, loading: municipalitiesLoading } =
    useMunicipalityKPIs({ enabled: entityType === "municipality" });
  const {
    municipalities: municipalitiesWithRegion,
    municipalitiesLoading: municipalitiesListLoading,
  } = useMunicipalities({ enabled: entityType === "municipality" });
  const { regionsData, loading: regionsLoading } = useRegionsKPIs({
    enabled: entityType !== "municipality",
  });
  const { nation, loading: nationLoading } = useNationDetails();

  const metrics = useMemo(() => {
    if (entityType === "municipality") {
      return getMunicipalityMetricDefinitions(t);
    }
    return getRegionNationMetricDefinitions(t);
  }, [entityType, t]);

  const [selectedMetricKey, setSelectedMetricKey] = useState(
    metrics[0]?.key ?? "historicalEmissionChangePercent",
  );

  const selectedMetric =
    metrics.find((metric) => metric.key === selectedMetricKey) ?? metrics[0];

  const municipalities = useMemo(() => {
    const regionByName = new Map(
      municipalitiesWithRegion.map((item) => [item.name, item.region]),
    );

    return municipalitiesData.map((item) => ({
      ...normalizeMunicipalityKpiApiItem(item),
      region: regionByName.get(item.name),
    })) as (MunicipalityKpiItem & { region?: string })[];
  }, [municipalitiesData, municipalitiesWithRegion]);

  const benchmarkData = useMemo((): TerritoryBenchmarkData | null => {
    if (!selectedMetric) return null;

    if (entityType === "municipality") {
      return buildMunicipalityBenchmarkData(
        selectedMetric,
        entityId,
        regionName,
        municipalities as MunicipalityKpiItem[],
        entityValueOverrides,
      );
    }

    if (entityType === "region") {
      return buildRegionBenchmarkData(
        selectedMetric,
        entityId,
        regionsData,
        nation?.historicalEmissionChangePercent ?? null,
        entityValueOverrides,
      );
    }

    return buildNationBenchmarkData(
      selectedMetric,
      nation?.historicalEmissionChangePercent ?? null,
      regionsData,
    );
  }, [
    entityType,
    entityId,
    entityValueOverrides,
    municipalities,
    nation?.historicalEmissionChangePercent,
    regionName,
    regionsData,
    selectedMetric,
  ]);

  const referenceLabels = useMemo(
    () => ({
      national: t("territoryBenchmarks.nationalAverage"),
      regional: regionName
        ? t("territoryBenchmarks.regionalAverage", { region: regionName })
        : t("territoryBenchmarks.regionalAverageGeneric"),
      entity: entityName,
      regionalAverage: t("territoryBenchmarks.regionsAverage"),
    }),
    [entityName, regionName, t],
  );

  const labeledReferences = useMemo(() => {
    if (!benchmarkData) return [];
    return benchmarkData.references.map((reference) => {
      if (reference.id === "national") {
        return { ...reference, label: referenceLabels.national };
      }
      if (reference.id === "regional") {
        return {
          ...reference,
          label: regionName
            ? referenceLabels.regional
            : referenceLabels.regionalAverage,
        };
      }
      if (reference.id === "regional-average") {
        return { ...reference, label: referenceLabels.regionalAverage };
      }
      if (reference.id === "entity") {
        return { ...reference, label: referenceLabels.entity };
      }
      return reference;
    });
  }, [benchmarkData, referenceLabels, regionName]);

  return {
    metrics,
    selectedMetricKey,
    setSelectedMetricKey,
    selectedMetric,
    benchmarkData: benchmarkData
      ? { ...benchmarkData, references: labeledReferences }
      : null,
    loading:
      (entityType === "municipality" &&
        (municipalitiesLoading || municipalitiesListLoading)) ||
      (entityType !== "municipality" && (regionsLoading || nationLoading)),
    entityName,
  };
}
