import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { createSymmetricRangeGradient } from "@/utils/ui/colorGradients";
import { useBeeswarmData } from "@/hooks/companies/useBeeswarmData";
import { BeeswarmChart } from "@/components/companies/rankedList/visualizations/shared/BeeswarmChart";
import type { BenchmarkDistributionItem } from "@/types/territoryBenchmarks";
import { getEntityDetailPath } from "@/utils/routing";
import type { TerritoryBenchmarkEntityType } from "@/types/territoryBenchmarks";

interface BenchmarkDistributionChartProps {
  distribution: BenchmarkDistributionItem[];
  unit: string;
  entityType: TerritoryBenchmarkEntityType;
  referenceLines?: Array<{ value: number; label: string; color?: string }>;
}

export function BenchmarkDistributionChart({
  distribution,
  unit,
  entityType,
  referenceLines = [],
}: BenchmarkDistributionChartProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    valid: chartData,
    min,
    max,
    colorForValue,
  } = useBeeswarmData(
    distribution,
    (item) => item.value,
    (rangeMin, rangeMax) => (value: number) =>
      createSymmetricRangeGradient(rangeMin, rangeMax, value),
  );

  const rankMap = useMemo(() => {
    const sorted = [...chartData].sort((a, b) => a.value - b.value);
    const map = new Map<string, number>();
    sorted.forEach((item, index) => {
      map.set(item.id, index + 1);
    });
    return map;
  }, [chartData]);

  const highlightId = useMemo(
    () => chartData.find((item) => item.isCurrentEntity)?.id,
    [chartData],
  );

  if (chartData.length === 0) {
    return (
      <div className="rounded-level-2 bg-black-1/60 p-8 flex items-center justify-center min-h-[280px]">
        <p className="text-grey">{t("territoryBenchmarks.noDistributionData")}</p>
      </div>
    );
  }

  const detailPathPrefix =
    entityType === "municipality"
      ? "municipality"
      : entityType === "region"
        ? "region"
        : null;

  return (
    <div className="rounded-level-2 bg-black-1/60 p-4 md:p-6">
      <BeeswarmChart
        data={chartData}
        getValue={(item) => item.value}
        getCompanyName={(item) => item.name}
        getCompanyId={(item) => item.id}
        colorForValue={colorForValue}
        min={min}
        max={max}
        unit={unit === "%" ? "%" : unit ? ` ${unit}` : ""}
        xReferenceLines={referenceLines}
        getRank={(item) => rankMap.get(item.id) ?? null}
        totalCount={chartData.length}
        highlightId={highlightId}
        onCompanyClick={
          detailPathPrefix
            ? (item) => navigate(getEntityDetailPath(detailPathPrefix, item.name))
            : undefined
        }
      />
    </div>
  );
}
