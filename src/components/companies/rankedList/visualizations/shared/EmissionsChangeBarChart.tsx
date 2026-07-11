import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CompanyWithKPIs } from "@/types/company";
import { COLORS } from "@/lib/colors";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useChartMotion } from "@/hooks/useChartMotion";
import {
  formatEmissionsAbsolute,
  formatEmissionsAbsoluteCompact,
} from "@/utils/formatting/localization";
import { createSymmetricRangeGradient } from "@/utils/ui/colorGradients";
import {
  buildEmissionsChangeHistogram,
  type EmissionsChangeCompanyEntry,
  type EmissionsChangeHistogramBin,
} from "@/utils/visualizations/emissionsChangeHistogram";
import { BeeswarmLegend } from "./BeeswarmLegend";

const SEGMENT_RADIUS = 6;
const Y_AXIS_WIDTH = 56;

interface EmissionsChangeBarChartProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

function formatCompactBinLabel(label: string): string {
  const [start] = label.split("–");
  return start.replace("%", "");
}

function getChangeColor(
  changePercent: number,
  minChange: number,
  maxChange: number,
): string {
  return createSymmetricRangeGradient(minChange, maxChange, changePercent);
}

function buildLegendGradient(
  minChange: number,
  maxChange: number,
): string | undefined {
  if (!Number.isFinite(minChange) || !Number.isFinite(maxChange)) {
    return undefined;
  }

  if (minChange === maxChange) {
    return getChangeColor(minChange, minChange, maxChange);
  }

  const steps = 5;
  const stops = Array.from({ length: steps }, (_, index) => {
    const percent = (index / (steps - 1)) * 100;
    const value = minChange + ((maxChange - minChange) * index) / (steps - 1);
    return `${getChangeColor(value, minChange, maxChange)} ${percent}%`;
  });

  return `linear-gradient(to right, ${stops.join(", ")})`;
}

function buildYAxisTicks(maxValue: number, tickCount = 4): number[] {
  if (maxValue <= 0) {
    return [0];
  }

  const step = maxValue / tickCount;
  return Array.from({ length: tickCount + 1 }, (_, index) =>
    Math.round(index * step),
  );
}

export function EmissionsChangeBarChart({
  companies,
  onCompanyClick,
}: EmissionsChangeBarChartProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const { reduceMotion } = useChartMotion();
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [hoveredCompanyId, setHoveredCompanyId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    company: EmissionsChangeCompanyEntry;
    binLabel: string;
    x: number;
    y: number;
  } | null>(null);

  const histogram = useMemo(
    () => buildEmissionsChangeHistogram(companies),
    [companies],
  );

  const companySourceById = useMemo(() => {
    const map = new Map<string, CompanyWithKPIs>();
    companies.forEach((company) => {
      map.set(company.id, company);
    });
    return map;
  }, [companies]);

  const { bins, companyEntryById, changeRange } = useMemo(() => {
    if (!histogram) {
      return {
        bins: [] as EmissionsChangeHistogramBin[],
        companyEntryById: new Map<string, EmissionsChangeCompanyEntry>(),
        changeRange: { min: 0, max: 0 },
      };
    }

    const entries = new Map<string, EmissionsChangeCompanyEntry>();
    histogram.bins.forEach((bin) => {
      bin.companies.forEach((company) => {
        entries.set(company.id, company);
      });
    });

    const values = Array.from(entries.values()).map(
      (company) => company.changePercent,
    );

    return {
      bins: histogram.bins,
      companyEntryById: entries,
      changeRange: {
        min: values.length ? Math.min(...values) : 0,
        max: values.length ? Math.max(...values) : 0,
      },
    };
  }, [histogram]);

  const legendGradient = useMemo(
    () => buildLegendGradient(changeRange.min, changeRange.max),
    [changeRange.max, changeRange.min],
  );

  const maxTotalEmissions = histogram?.maxTotalEmissions ?? 0;

  const yAxisTicks = useMemo(
    () => buildYAxisTicks(maxTotalEmissions),
    [maxTotalEmissions],
  );

  const highlightedCompanyId = hoveredCompanyId ?? activeCompanyId;

  const handleSegmentClick = useCallback(
    (companyId: string) => {
      if (isMobile) {
        setActiveCompanyId((current) =>
          current === companyId ? null : companyId,
        );
        return;
      }

      const company = companySourceById.get(companyId);
      if (company) {
        onCompanyClick?.(company);
      }
    },
    [companySourceById, isMobile, onCompanyClick],
  );

  const handleSegmentPointerEnter = useCallback(
    (
      event: React.MouseEvent,
      company: EmissionsChangeCompanyEntry,
      binLabel: string,
    ) => {
      setHoveredCompanyId(company.id);
      setTooltip({
        company,
        binLabel,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [],
  );

  const handleSegmentPointerMove = useCallback(
    (
      event: React.MouseEvent,
      company: EmissionsChangeCompanyEntry,
      binLabel: string,
    ) => {
      setTooltip({
        company,
        binLabel,
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

  if (!histogram || bins.length === 0) {
    return null;
  }

  return (
    <div className="relative flex h-full min-h-[400px] w-full flex-col">
      <div className="relative min-h-[320px] flex-1 border-b border-t border-black-4">
        <div className="absolute inset-x-0 bottom-8 top-4 flex">
          <div className="relative shrink-0" style={{ width: Y_AXIS_WIDTH }}>
            {yAxisTicks
              .slice()
              .reverse()
              .map((tick) => (
                <span
                  key={tick}
                  className="absolute right-2 -translate-y-1/2 text-[11px] text-white/45"
                  style={{
                    bottom: `${
                      maxTotalEmissions > 0
                        ? (tick / maxTotalEmissions) * 100
                        : 0
                    }%`,
                  }}
                >
                  {formatEmissionsAbsoluteCompact(tick, currentLanguage)}
                </span>
              ))}
          </div>

          <div className="flex min-w-0 flex-1 items-end gap-1 px-2">
            {bins.map((bin) => {
              const barHeightPercent =
                maxTotalEmissions > 0
                  ? (bin.totalEmissions / maxTotalEmissions) * 100
                  : 0;

              return (
                <div
                  key={bin.id}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                >
                  <div
                    className="flex w-full max-w-[32px] flex-col gap-px overflow-hidden rounded-md"
                    style={{
                      height: `${barHeightPercent}%`,
                      backgroundColor: COLORS.black2,
                      transition: reduceMotion ? undefined : "height 0.5s ease-out",
                    }}
                  >
                    {bin.companies.map((company) => {
                      const isHighlighted = highlightedCompanyId === company.id;
                      const isDimmed =
                        highlightedCompanyId != null &&
                        highlightedCompanyId !== company.id;

                      return (
                        <button
                          key={company.id}
                          type="button"
                          className="w-full min-h-[1px] cursor-pointer border-0 p-0"
                          style={{
                            flex: `${company.emissions} 1 0`,
                            backgroundColor: getChangeColor(
                              company.changePercent,
                              changeRange.min,
                              changeRange.max,
                            ),
                            borderRadius: SEGMENT_RADIUS,
                            opacity: isDimmed ? 0.45 : 1,
                            boxShadow: isHighlighted
                              ? "inset 0 0 0 2px rgba(255,255,255,0.9)"
                              : undefined,
                          }}
                          aria-label={company.name}
                          onClick={() => handleSegmentClick(company.id)}
                          onMouseEnter={(event) =>
                            handleSegmentPointerEnter(
                              event,
                              company,
                              bin.label,
                            )
                          }
                          onMouseMove={(event) =>
                            handleSegmentPointerMove(event, company, bin.label)
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

        <div className="absolute inset-x-0 bottom-1 flex gap-1 px-2">
          {bins.map((bin) => (
            <span
              key={`${bin.id}-label`}
              className="min-w-0 flex-1 truncate text-center text-[11px] text-white/45"
              title={bin.label}
            >
              {formatCompactBinLabel(bin.label)}
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
          <p className="text-xl font-medium">{tooltip.company.name}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-white/50">{tooltip.binLabel}</p>
            <p className="text-white/70">
              <span className="text-orange-2">
                {formatEmissionsAbsolute(
                  tooltip.company.emissions,
                  currentLanguage,
                )}{" "}
                tCO2e
              </span>
            </p>
            <p className="text-sm text-white/50">
              {t(
                "companiesOverviewPage.visualizations.emissionsChange.tooltip.change",
                { value: tooltip.company.changePercent.toFixed(1) },
              )}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-col items-center gap-3 md:flex-row md:items-center md:justify-between">
          <BeeswarmLegend
            min={changeRange.min}
            max={changeRange.max}
            unit="%"
            gradientBackground={legendGradient}
          />
          <span className="px-1 text-xs text-grey">
            {t(
              "companiesOverviewPage.visualizations.emissionsChange.companiesCount",
              { count: companyEntryById.size },
            )}
          </span>
        </div>

        <p className="px-1 text-center text-xs text-white/40 md:text-left">
          {t(
            "companiesOverviewPage.visualizations.emissionsChange.segmentHint",
          )}
        </p>
      </div>

      {isMobile && activeCompanyId && companyEntryById.has(activeCompanyId) && (
        <button
          type="button"
          className="mt-3 w-full rounded-level-2 bg-black-1 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-white/5"
          onClick={() => {
            const company = companySourceById.get(activeCompanyId);
            if (company) {
              onCompanyClick?.(company);
            }
          }}
        >
          <span className="font-medium">
            {companyEntryById.get(activeCompanyId)!.name}
          </span>
          <span className="mt-1 block text-orange-2">
            {formatEmissionsAbsolute(
              companyEntryById.get(activeCompanyId)!.emissions,
              currentLanguage,
            )}{" "}
            tCO2e
          </span>
          <span className="mt-1 block text-sm text-white/50">
            {t(
              "companiesOverviewPage.visualizations.emissionsChange.tooltip.change",
              {
                value: companyEntryById
                  .get(activeCompanyId)!
                  .changePercent.toFixed(1),
              },
            )}
          </span>
        </button>
      )}
    </div>
  );
}
