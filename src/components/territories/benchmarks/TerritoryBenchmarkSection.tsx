import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { CardHeader } from "@/components/layout/CardHeader";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useTerritoryBenchmarks } from "@/hooks/territories/useTerritoryBenchmarks";
import type { TerritoryBenchmarkEntityType } from "@/types/territoryBenchmarks";
import { BenchmarkComparisonBars } from "./BenchmarkComparisonBars";
import { BenchmarkSummaryCards } from "./BenchmarkSummaryCards";
import { BenchmarkDistributionChart } from "./BenchmarkDistributionChart";
import { PageLoading } from "@/components/pageStates/Loading";

type BenchmarkView = "comparison" | "distribution";

interface TerritoryBenchmarkSectionProps {
  entityType: TerritoryBenchmarkEntityType;
  entityId: string;
  entityName: string;
  regionName?: string;
  entityValueOverrides?: Partial<Record<string, number | null>>;
}

export function TerritoryBenchmarkSection({
  entityType,
  entityId,
  entityName,
  regionName,
  entityValueOverrides,
}: TerritoryBenchmarkSectionProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<BenchmarkView>("comparison");
  const {
    metrics,
    selectedMetricKey,
    setSelectedMetricKey,
    selectedMetric,
    benchmarkData,
    loading,
    entityName: resolvedEntityName,
  } = useTerritoryBenchmarks({
    entityType,
    entityId,
    entityName,
    regionName,
    entityValueOverrides,
  });

  if (loading || !benchmarkData || !selectedMetric) {
    return (
      <SectionWithHelp helpItems={["municipalityDeeperChanges"]}>
        <CardHeader
          title={t("territoryBenchmarks.title")}
          description={t("territoryBenchmarks.description")}
          layout="wide"
        />
        <div className="min-h-[240px] flex items-center justify-center">
          <PageLoading />
        </div>
      </SectionWithHelp>
    );
  }

  const referenceLines = benchmarkData.references
    .filter(
      (reference) =>
        reference.id !== "entity" &&
        reference.value !== null &&
        reference.value !== undefined,
    )
    .map((reference) => ({
      value: reference.value as number,
      label: reference.label,
      color:
        reference.id === "national" || reference.id === "regional-average"
          ? "var(--green-3)"
          : "var(--blue-3)",
    }));

  return (
    <SectionWithHelp helpItems={["municipalityDeeperChanges"]}>
      <CardHeader
        title={t("territoryBenchmarks.title")}
        description={t("territoryBenchmarks.description")}
        layout="wide"
      />

      <div className="flex flex-wrap gap-2 mb-8">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            type="button"
            onClick={() => setSelectedMetricKey(metric.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-colors border",
              selectedMetricKey === metric.key
                ? "border-orange-2 bg-orange-2/10 text-orange-2"
                : "border-black-1 bg-black-1/40 text-grey hover:text-white hover:border-black-4",
            )}
          >
            {metric.label}
          </button>
        ))}
      </div>

      <Text className="text-sm text-grey mb-8">{selectedMetric.description}</Text>

      <BenchmarkSummaryCards
        benchmarkData={benchmarkData}
        entityName={resolvedEntityName}
      />

      <div className="mt-10 flex flex-wrap gap-2">
        {(["comparison", "distribution"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setView(mode)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-colors",
              view === mode
                ? "bg-white text-black-3"
                : "bg-black-1 text-grey hover:text-white",
            )}
          >
            {t(`territoryBenchmarks.views.${mode}`)}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {view === "comparison" ? (
          <BenchmarkComparisonBars
            references={benchmarkData.references}
            unit={selectedMetric.unit}
            higherIsBetter={selectedMetric.higherIsBetter}
            symmetric={selectedMetric.unit === "%"}
          />
        ) : (
          <BenchmarkDistributionChart
            distribution={benchmarkData.distribution}
            unit={selectedMetric.unit}
            entityType={entityType}
            referenceLines={referenceLines}
          />
        )}
      </div>
    </SectionWithHelp>
  );
}
