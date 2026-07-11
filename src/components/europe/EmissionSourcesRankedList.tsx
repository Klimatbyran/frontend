import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import RankedList from "@/components/ranked/RankedList";
import { useLanguage } from "@/components/LanguageProvider";
import { useClimateTraceSectors } from "@/hooks/europe/useClimateTraceSectors";
import { RankedClimateTraceSource } from "@/lib/climateTraceSources";
import { DataPoint, RankedListItem } from "@/types/rankings";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";
import { cn } from "@/lib/utils";

export type EmissionSourceListItem = RankedListItem & {
  sourceId: number;
  emissionsQuantity: number;
  sector: string;
};

function toEmissionSourceListItems(
  sources: RankedClimateTraceSource[],
): EmissionSourceListItem[] {
  return sources.map((source) => ({
    id: String(source.id),
    sourceId: source.id,
    name: source.name,
    displayName: source.name,
    mapName: source.name,
    emissionsQuantity: source.emissionsQuantity,
    sector: source.sector,
  }));
}

interface EmissionSourcesRankedListProps {
  sources: RankedClimateTraceSource[];
  loading?: boolean;
  hoveredSourceId?: number | null;
  onHoverSource?: (sourceId: number | null) => void;
  headerAction?: React.ReactNode;
  className?: string;
}

export function EmissionSourcesRankedList({
  sources,
  loading = false,
  hoveredSourceId = null,
  onHoverSource,
  headerAction,
  className,
}: EmissionSourcesRankedListProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { getSectorInfo } = useClimateTraceSectors();

  const listItems = useMemo(
    () => toEmissionSourceListItems(sources),
    [sources],
  );

  const selectedDataPoint = useMemo(
    (): DataPoint<EmissionSourceListItem> => ({
      label: t("europe.detailPage.emissionSources.listLabel"),
      key: "emissionsQuantity",
      unit: t("emissionsUnit"),
      higherIsBetter: true,
      formatter: (value) =>
        formatEmissionsAbsoluteCompact(
          Math.round(value as number),
          currentLanguage,
        ),
    }),
    [currentLanguage, t],
  );

  if (loading) {
    return (
      <div
        className={cn(
          "h-full min-h-[20rem] animate-pulse rounded-2xl border border-white/10 bg-black-2",
          className,
        )}
      />
    );
  }

  if (listItems.length === 0) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[20rem] items-center justify-center rounded-2xl border border-white/10 bg-black-2 px-6 text-center text-sm text-white/70",
          className,
        )}
      >
        {t("europe.detailPage.emissionSources.empty")}
      </div>
    );
  }

  return (
    <RankedList
      data={listItems}
      selectedDataPoint={selectedDataPoint}
      searchKey="displayName"
      searchPlaceholder={t("rankedList.search.placeholder")}
      headerAction={headerAction}
      className={cn("h-full min-h-0", className)}
      colorItem={(item) => getSectorInfo(item.sector).color}
      renderItem={(item, _index, _startIndex, originalRank) => {
        const color = getSectorInfo(item.sector).color;
        const formattedValue = formatEmissionsAbsoluteCompact(
          Math.round(item.emissionsQuantity),
          currentLanguage,
        );
        const isHovered = hoveredSourceId === item.sourceId;

        return (
          <div
            key={item.id}
            onMouseEnter={() => onHoverSource?.(item.sourceId)}
            onMouseLeave={() => onHoverSource?.(null)}
            className={cn(isHovered && "bg-black/70")}
          >
            <div className="flex w-full items-center justify-between p-4 transition-colors group">
              <div className="flex min-w-0 items-center gap-4">
                <span className="w-8 shrink-0 text-left text-sm tabular-nums text-white/30">
                  {originalRank}
                </span>
                <span className="truncate text-left text-sm text-white/90 md:text-base">
                  {item.displayName}
                </span>
              </div>
              <span
                className="shrink-0 text-right text-sm font-semibold md:text-base"
                style={{ color }}
              >
                {formattedValue}
              </span>
            </div>
          </div>
        );
      }}
    />
  );
}
