import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CompanyWithKPIs } from "@/types/company";
import { getCompanyColors } from "@/lib/constants/companyColors";
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

interface EmissionsChangeBarChartProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

interface TooltipState {
  company: EmissionsChangeCompanyEntry;
  position: { x: number; y: number };
}

function getYAxisTicks(maxValue: number): number[] {
  if (maxValue <= 0) {
    return [0];
  }

  const roughStep = maxValue / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;
  const niceNormalized =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  const ticks: number[] = [];

  for (let value = 0; value <= maxValue; value += step) {
    ticks.push(Math.round(value));
  }

  if (ticks[ticks.length - 1] < maxValue) {
    ticks.push(Math.round(maxValue));
  }

  return ticks;
}

function getBinColor(
  bin: EmissionsChangeHistogramBin,
  minChange: number,
  maxChange: number,
): string {
  const midpoint = (bin.min + bin.max) / 2;
  return createSymmetricRangeGradient(minChange, maxChange, midpoint);
}

function formatCompactBinLabel(label: string): string {
  const [start] = label.split("–");
  return start.replace("%", "");
}

export function EmissionsChangeBarChart({
  companies,
  onCompanyClick,
}: EmissionsChangeBarChartProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const { reduceMotion, barDuration } = useChartMotion();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [mobileTooltipOpen, setMobileTooltipOpen] = useState(false);
  const [mobileSelectedCompanyId, setMobileSelectedCompanyId] = useState<
    string | null
  >(null);

  const histogram = useMemo(
    () => buildEmissionsChangeHistogram(companies),
    [companies],
  );

  const companyById = useMemo(() => {
    const map = new Map<string, CompanyWithKPIs>();
    companies.forEach((company) => {
      map.set(company.id, company);
    });
    return map;
  }, [companies]);

  const changeRange = useMemo(() => {
    if (!histogram) {
      return { min: 0, max: 0 };
    }

    const values = histogram.bins.flatMap((bin) =>
      bin.companies.map((company) => company.changePercent),
    );

    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [histogram]);

  const yTicks = useMemo(
    () => (histogram ? getYAxisTicks(histogram.maxTotalEmissions) : [0]),
    [histogram],
  );

  const handleSegmentInteraction = useCallback(
    (
      company: EmissionsChangeCompanyEntry,
      event: React.MouseEvent<HTMLDivElement>,
    ) => {
      if (isMobile) {
        if (mobileTooltipOpen && mobileSelectedCompanyId === company.id) {
          const sourceCompany = companyById.get(company.id);
          if (sourceCompany) {
            onCompanyClick?.(sourceCompany);
          }
          setMobileTooltipOpen(false);
          setMobileSelectedCompanyId(null);
          setTooltip(null);
          return;
        }

        setMobileTooltipOpen(true);
        setMobileSelectedCompanyId(company.id);
        setTooltip({
          company,
          position: { x: event.clientX, y: event.clientY },
        });
        return;
      }

      const sourceCompany = companyById.get(company.id);
      if (sourceCompany) {
        onCompanyClick?.(sourceCompany);
      }
    },
    [
      companyById,
      isMobile,
      mobileSelectedCompanyId,
      mobileTooltipOpen,
      onCompanyClick,
    ],
  );

  const handleSegmentHover = useCallback(
    (company: EmissionsChangeCompanyEntry, event: React.MouseEvent) => {
      if (isMobile) {
        return;
      }

      setTooltip({
        company,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    [isMobile],
  );

  if (!histogram || histogram.bins.length === 0) {
    return null;
  }

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-col gap-3"
      onClick={() => {
        if (isMobile && mobileTooltipOpen) {
          setMobileTooltipOpen(false);
          setMobileSelectedCompanyId(null);
          setTooltip(null);
        }
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-full min-h-0 w-full min-w-0 flex-1 gap-2 overflow-hidden">
          <div className="flex h-full w-12 shrink-0 flex-col justify-between py-0 text-right text-[10px] text-grey">
            {[...yTicks].reverse().map((tick) => (
              <span key={tick}>
                {formatEmissionsAbsoluteCompact(tick, currentLanguage)}
              </span>
            ))}
          </div>

          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex h-full min-h-0 flex-1 items-end gap-px border-b border-black-4">
              {histogram.bins.map((bin) => {
                const barHeight =
                  histogram.maxTotalEmissions > 0
                    ? (bin.totalEmissions / histogram.maxTotalEmissions) * 100
                    : 0;
                const binColor = getBinColor(
                  bin,
                  changeRange.min,
                  changeRange.max,
                );

                return (
                  <div
                    key={bin.id}
                    className="flex h-full min-w-0 flex-1 basis-0 flex-col items-center justify-end"
                  >
                    <div
                      className="flex w-full flex-col justify-end overflow-hidden rounded-t-sm border border-black-4/80"
                      style={{
                        height: `${barHeight}%`,
                        minHeight: bin.companies.length > 0 ? "6px" : "0px",
                        transition: reduceMotion
                          ? undefined
                          : `height ${barDuration}s ease-out`,
                      }}
                      title={t(
                        "companiesOverviewPage.visualizations.emissionsChange.binSummary",
                        {
                          range: bin.label,
                          count: bin.companies.length,
                          emissions: formatEmissionsAbsolute(
                            bin.totalEmissions,
                            currentLanguage,
                          ),
                        },
                      )}
                    >
                      {bin.companies.map((company) => {
                        const segmentHeight =
                          bin.totalEmissions > 0
                            ? (company.emissions / bin.totalEmissions) * 100
                            : 0;
                        const color = getCompanyColors(company.colorIndex).base;

                        return (
                          <div
                            key={company.id}
                            className="w-full min-w-0 cursor-pointer transition-opacity hover:opacity-80"
                            style={{
                              height: `${segmentHeight}%`,
                              minHeight: segmentHeight > 0 ? "1px" : "0px",
                              backgroundColor: color,
                              boxShadow: `inset 0 0 0 1px ${binColor}33`,
                            }}
                            onMouseEnter={(event) =>
                              handleSegmentHover(company, event)
                            }
                            onMouseMove={(event) =>
                              handleSegmentHover(company, event)
                            }
                            onMouseLeave={() => setTooltip(null)}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSegmentInteraction(company, event);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-1 flex w-full shrink-0 gap-px overflow-hidden">
              {histogram.bins.map((bin) => (
                <div
                  key={`${bin.id}-label`}
                  className="min-w-0 flex-1 basis-0 truncate text-center text-[9px] leading-tight text-grey"
                  title={bin.label}
                >
                  {formatCompactBinLabel(bin.label)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 text-xs text-grey">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{
              background: createSymmetricRangeGradient(
                changeRange.min,
                changeRange.max,
                changeRange.min,
              ),
            }}
          />
          <span>
            {t(
              "companiesOverviewPage.visualizations.emissionsChange.legend.reduction",
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{
              background: createSymmetricRangeGradient(
                changeRange.min,
                changeRange.max,
                0,
              ),
            }}
          />
          <span>
            {t(
              "companiesOverviewPage.visualizations.emissionsChange.legend.neutral",
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{
              background: createSymmetricRangeGradient(
                changeRange.min,
                changeRange.max,
                changeRange.max,
              ),
            }}
          />
          <span>
            {t(
              "companiesOverviewPage.visualizations.emissionsChange.legend.increase",
            )}
          </span>
        </div>
      </div>

      {tooltip && (!isMobile || mobileTooltipOpen) && (
        <div
          className="pointer-events-none fixed z-50 rounded-level-1 border border-black-4 bg-black-1 px-3 py-2 text-xs text-white shadow-xl"
          style={{
            left: tooltip.position.x + 12,
            top: tooltip.position.y + 12,
          }}
        >
          <p className="font-medium">{tooltip.company.name}</p>
          <p className="text-grey">
            {t(
              "companiesOverviewPage.visualizations.emissionsChange.tooltip.change",
              { value: tooltip.company.changePercent.toFixed(1) },
            )}
          </p>
          <p className="text-grey">
            {t(
              "companiesOverviewPage.visualizations.emissionsChange.tooltip.emissions",
              {
                value: formatEmissionsAbsolute(
                  tooltip.company.emissions,
                  currentLanguage,
                ),
              },
            )}
          </p>
          {isMobile && (
            <p className="mt-1 text-white/70">
              {t(
                "companiesOverviewPage.visualizations.emissionsChange.tooltip.tapAgain",
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
