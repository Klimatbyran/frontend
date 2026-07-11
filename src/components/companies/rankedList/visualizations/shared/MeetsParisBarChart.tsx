import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useChartMotion } from "@/hooks/useChartMotion";
import { useScreenSize } from "@/hooks/useScreenSize";
import { COLORS } from "@/lib/colors";
import { getCompanyUrlSegment } from "@/utils/companyRouting";
import { formatWithScale } from "@/utils/data/unitScaling";
import type { CompanyParisEmissionsEntry } from "@/utils/insights/meetsParisChartData";

const SEGMENT_RADIUS = 6;
const BAR_MAX_WIDTH = 180;
const Y_AXIS_WIDTH = 72;
const CHART_MIN_HEIGHT = 260;
const OUTER_MIN_HEIGHT = 320;
const PLOT_INSET_TOP = 8;
const TOP_EMITTERS_PER_BAR = 10;

interface MeetsParisBarChartProps {
  entries: CompanyParisEmissionsEntry[];
  unitScale: { unit: string; divisor: number };
  onCompanyClick?: (entry: CompanyParisEmissionsEntry) => void;
}

interface ChartSegment {
  id: string;
  emissions: number;
  entry: CompanyParisEmissionsEntry | null;
  aggregateCount?: number;
}

interface BarGroup {
  category: string;
  categoryKey: "yes" | "no";
  color: string;
  total: number;
  segments: ChartSegment[];
}

function getEntryKey(entry: CompanyParisEmissionsEntry): string {
  return getCompanyUrlSegment(entry.company);
}

function buildYAxisTicks(maxValue: number, tickCount = 4): number[] {
  if (maxValue <= 0) return [0];

  const step = maxValue / tickCount;
  return Array.from({ length: tickCount + 1 }, (_, index) =>
    Number((index * step).toFixed(2)),
  );
}

export function MeetsParisBarChart({
  entries,
  unitScale,
  onCompanyClick,
}: MeetsParisBarChartProps) {
  const { t } = useTranslation();
  const { reduceMotion } = useChartMotion();
  const { isMobile } = useScreenSize();
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [hoveredCompanyId, setHoveredCompanyId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    segment: ChartSegment;
    x: number;
    y: number;
  } | null>(null);

  const trueLabel = t("companiesOverviewPage.visualizations.meetsParis.yes");
  const falseLabel = t("companiesOverviewPage.visualizations.meetsParis.no");
  const otherLabel = t(
    "companiesOverviewPage.visualizations.meetsParis.otherSegment",
  );

  const { groups, companyById, maxBarTotal } = useMemo(() => {
    const yesEntries = entries.filter((entry) => entry.meetsParis);
    const noEntries = entries.filter((entry) => !entry.meetsParis);
    const byId = new Map(entries.map((entry) => [getEntryKey(entry), entry]));

    const buildGroup = (
      category: string,
      categoryKey: "yes" | "no",
      color: string,
      groupEntries: CompanyParisEmissionsEntry[],
    ): BarGroup => {
      const sortedDesc = [...groupEntries].sort(
        (a, b) => b.emissions - a.emissions,
      );
      const topEntries = sortedDesc.slice(0, TOP_EMITTERS_PER_BAR);
      const remainingEntries = sortedDesc.slice(TOP_EMITTERS_PER_BAR);

      const individualSegments: ChartSegment[] = topEntries.map((entry) => ({
        id: getEntryKey(entry),
        entry,
        emissions: entry.emissions,
      }));

      const otherSegment: ChartSegment | null =
        remainingEntries.length > 0
          ? {
              id: `other-${categoryKey}`,
              entry: null,
              emissions: remainingEntries.reduce(
                (sum, entry) => sum + entry.emissions,
                0,
              ),
              aggregateCount: remainingEntries.length,
            }
          : null;

      // Stack top-to-bottom: largest emitters on top, smaller above Other, Other at bottom.
      const segments = otherSegment
        ? [...individualSegments, otherSegment]
        : individualSegments;

      return {
        category,
        categoryKey,
        color,
        total: groupEntries.reduce((sum, entry) => sum + entry.emissions, 0),
        segments,
      };
    };

    const chartGroups = [
      buildGroup(falseLabel, "no", COLORS.pink3, noEntries),
      buildGroup(trueLabel, "yes", COLORS.blue3, yesEntries),
    ];

    return {
      groups: chartGroups,
      companyById: byId,
      maxBarTotal: Math.max(...chartGroups.map((group) => group.total), 0),
    };
  }, [entries, falseLabel, trueLabel]);

  const yAxisTicks = useMemo(
    () => buildYAxisTicks(maxBarTotal / unitScale.divisor),
    [maxBarTotal, unitScale.divisor],
  );

  const formatAxisTick = useCallback(
    (value: number) => `${value.toFixed(1)}${unitScale.unit}`,
    [unitScale.unit],
  );

  const highlightedCompanyId = hoveredCompanyId ?? activeCompanyId;

  const handleSegmentClick = useCallback(
    (segment: ChartSegment) => {
      if (!segment.entry) {
        if (isMobile) {
          setActiveCompanyId((current) =>
            current === segment.id ? null : segment.id,
          );
        }
        return;
      }

      if (isMobile) {
        setActiveCompanyId((current) =>
          current === segment.id ? null : segment.id,
        );
        return;
      }

      onCompanyClick?.(segment.entry);
    },
    [isMobile, onCompanyClick],
  );

  const handleSegmentPointerEnter = useCallback(
    (event: React.MouseEvent, segment: ChartSegment) => {
      setHoveredCompanyId(segment.id);
      setTooltip({
        segment,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [],
  );

  const handleSegmentPointerMove = useCallback(
    (event: React.MouseEvent, segment: ChartSegment) => {
      setTooltip({
        segment,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [],
  );

  const handleSegmentPointerLeave = useCallback(() => {
    setHoveredCompanyId(null);
    setTooltip(null);
  }, []);

  return (
    <div
      className="relative flex h-full w-full flex-col"
      style={{ minHeight: OUTER_MIN_HEIGHT }}
    >
      <div
        className="relative flex-1 border-t border-b border-black-4"
        style={{ minHeight: CHART_MIN_HEIGHT }}
      >
        <div
          className="absolute inset-0 flex items-end"
          style={{ paddingTop: PLOT_INSET_TOP }}
        >
          <div
            className="relative h-full shrink-0 pl-4"
            style={{ width: Y_AXIS_WIDTH }}
          >
            {yAxisTicks
              .slice()
              .reverse()
              .map((tick, _index, ticks) => {
                const maxTick = ticks[0];
                const isTopTick = tick === maxTick;
                const isBottomTick = tick === 0;

                return (
                  <span
                    key={tick}
                    className="absolute left-4 whitespace-nowrap text-[11px] text-white/45"
                    style={
                      isTopTick
                        ? { top: 0 }
                        : isBottomTick
                          ? { bottom: 0 }
                          : {
                              bottom: `${
                                maxBarTotal > 0
                                  ? (tick / (maxBarTotal / unitScale.divisor)) *
                                    100
                                  : 0
                              }%`,
                              transform: "translateY(50%)",
                            }
                    }
                  >
                    {formatAxisTick(tick)}
                  </span>
                );
              })}
          </div>

          <div className="flex h-full flex-1 items-end justify-center gap-[10%] px-2">
            {groups.map((group) => {
              const barHeightPercent =
                maxBarTotal > 0 ? (group.total / maxBarTotal) * 100 : 0;

              return (
                <div
                  key={group.category}
                  className="flex h-full flex-col items-center justify-end"
                  style={{ width: BAR_MAX_WIDTH, maxWidth: "48%" }}
                >
                  <div
                    className="flex w-full flex-col gap-px overflow-hidden rounded-md"
                    style={{
                      height: `${barHeightPercent}%`,
                      backgroundColor: COLORS.black2,
                      transition: reduceMotion
                        ? undefined
                        : "height 0.5s ease-out",
                    }}
                  >
                    {group.segments.map((segment) => {
                      const isHighlighted = highlightedCompanyId === segment.id;
                      const isDimmed =
                        highlightedCompanyId != null &&
                        highlightedCompanyId !== segment.id;

                      return (
                        <button
                          key={segment.id}
                          type="button"
                          className="w-full min-h-[1px] border-0 p-0 cursor-pointer"
                          style={{
                            flex: `${segment.emissions} 1 0`,
                            backgroundColor: group.color,
                            borderRadius: SEGMENT_RADIUS,
                            opacity: isDimmed ? 0.45 : 1,
                            boxShadow: isHighlighted
                              ? "inset 0 0 0 2px rgba(255,255,255,0.9)"
                              : undefined,
                          }}
                          aria-label={
                            segment.entry?.company.name ??
                            t(
                              "companiesOverviewPage.visualizations.meetsParis.otherSegmentAria",
                              { count: segment.aggregateCount ?? 0 },
                            )
                          }
                          onClick={() => handleSegmentClick(segment)}
                          onMouseEnter={(event) =>
                            handleSegmentPointerEnter(event, segment)
                          }
                          onMouseMove={(event) =>
                            handleSegmentPointerMove(event, segment)
                          }
                          onMouseLeave={handleSegmentPointerLeave}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 pt-2">
        <div className="shrink-0" style={{ width: Y_AXIS_WIDTH }} />
        <div className="flex flex-1 justify-center gap-[10%] px-2">
          {groups.map((group) => (
            <span
              key={group.category}
              className="text-center text-[13px] text-white/75"
              style={{ width: BAR_MAX_WIDTH, maxWidth: "48%" }}
            >
              {group.category}
            </span>
          ))}
        </div>
      </div>

      {tooltip && !isMobile && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-2xl bg-black/40 p-4 text-white backdrop-blur-sm"
          style={{
            left: tooltip.x,
            top: tooltip.y - 12,
          }}
        >
          {tooltip.segment.entry ? (
            <>
              <p className="text-xl font-medium">
                {tooltip.segment.entry.company.name}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-white/70">
                  <span className="text-orange-2">
                    {formatWithScale(tooltip.segment.emissions, unitScale)}
                  </span>
                </p>
                <p className="text-sm text-white/50">
                  {tooltip.segment.entry.meetsParis
                    ? t("companies.list.kpis.meetsParis.booleanLabels.true")
                    : t("companies.list.kpis.meetsParis.booleanLabels.false")}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-xl font-medium">{otherLabel}</p>
              <div className="mt-2 space-y-1">
                <p className="text-white/70">
                  <span className="text-orange-2">
                    {formatWithScale(tooltip.segment.emissions, unitScale)}
                  </span>
                </p>
                <p className="text-sm text-white/50">
                  {t(
                    "companiesOverviewPage.visualizations.meetsParis.otherSegmentCount",
                    { count: tooltip.segment.aggregateCount ?? 0 },
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-sm"
            style={{ backgroundColor: COLORS.pink3 }}
          />
          <span className="text-xs text-white/40">{falseLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-sm"
            style={{ backgroundColor: COLORS.blue3 }}
          />
          <span className="text-xs text-white/40">{trueLabel}</span>
        </div>
      </div>

      {isMobile && activeCompanyId && (
        <button
          type="button"
          className="mt-3 w-full rounded-level-2 bg-black-1 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-white/5"
          onClick={() => {
            const entry = companyById.get(activeCompanyId);
            if (entry) onCompanyClick?.(entry);
          }}
        >
          {companyById.has(activeCompanyId) ? (
            <>
              <span className="font-medium">
                {companyById.get(activeCompanyId)!.company.name}
              </span>
              <span className="mt-1 block text-orange-2">
                {formatWithScale(
                  companyById.get(activeCompanyId)!.emissions,
                  unitScale,
                )}
              </span>
            </>
          ) : (
            <>
              <span className="font-medium">{otherLabel}</span>
              <span className="mt-1 block text-orange-2">
                {formatWithScale(
                  groups
                    .flatMap((group) => group.segments)
                    .find((segment) => segment.id === activeCompanyId)
                    ?.emissions ?? 0,
                  unitScale,
                )}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
