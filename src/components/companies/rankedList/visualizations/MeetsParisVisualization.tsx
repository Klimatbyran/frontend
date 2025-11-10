import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateCarbonBudgetPercent } from "@/utils/calculations/carbonBudget";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import {
  createFixedRangeGradient,
  createStatisticalGradient,
} from "@/utils/visualizations/colorGradients";
import {
  groupCompaniesByIndustry,
  getCompanySectorName,
} from "@/utils/data/industryGrouping";
import { VisualizationModeSelector } from "./shared/VisualizationModeSelector";
import { SunburstChart } from "./shared/SunburstChart";
import { createSunburstTooltipFormatter } from "./shared/sunburstTooltips";
import type { ColorFunction } from "@/types/visualizations";

type Mode = "histogram" | "sunburst";
type ColorMode = "range" | "statistical";

interface MeetsParisVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

interface CompanyBudgetData {
  company: CompanyWithKPIs;
  budgetPercent: number;
  meetsParis: boolean | null;
}

interface CompanyGroup {
  key: string;
  rangeStart: number; // inclusive, can be -Infinity
  rangeEnd: number; // exclusive, can be +Infinity
  companies: CompanyBudgetData[];
  averagePercent: number; // average % for color
}

// Build dynamic X-axis bins based on data range
const buildDynamicBins = (percents: number[]) => {
  if (percents.length === 0)
    return [] as { rangeStart: number; rangeEnd: number; label: string }[];
  const min = Math.min(...percents);
  const max = Math.max(...percents);

  const bins: { rangeStart: number; rangeEnd: number; label: string }[] = [];

  // Negative side: always 4 bins below 0 (with overflow if needed)
  if (min < -100)
    bins.push({
      rangeStart: Number.NEGATIVE_INFINITY,
      rangeEnd: -100,
      label: "< -100%",
    });
  bins.push({
    rangeStart: Math.max(-100, -Infinity),
    rangeEnd: -50,
    label: min < -100 ? "-100% to -50%" : "-100% to -50%",
  });
  bins.push({ rangeStart: -50, rangeEnd: -20, label: "-50% to -20%" });
  bins.push({ rangeStart: -20, rangeEnd: 0, label: "-20% to 0%" });

  // Positive side: 4–6 bins depending on max
  if (max <= 20) {
    bins.push({ rangeStart: 0, rangeEnd: 10, label: "0% to 10%" });
    bins.push({ rangeStart: 10, rangeEnd: 20, label: "10% to 20%" });
  } else if (max <= 50) {
    bins.push({ rangeStart: 0, rangeEnd: 10, label: "0% to 10%" });
    bins.push({ rangeStart: 10, rangeEnd: 20, label: "10% to 20%" });
    bins.push({ rangeStart: 20, rangeEnd: 50, label: "20% to 50%" });
  } else if (max <= 100) {
    bins.push({ rangeStart: 0, rangeEnd: 20, label: "0% to 20%" });
    bins.push({ rangeStart: 20, rangeEnd: 50, label: "20% to 50%" });
    bins.push({ rangeStart: 50, rangeEnd: 100, label: "50% to 100%" });
  } else if (max <= 200) {
    bins.push({ rangeStart: 0, rangeEnd: 20, label: "0% to 20%" });
    bins.push({ rangeStart: 20, rangeEnd: 50, label: "20% to 50%" });
    bins.push({ rangeStart: 50, rangeEnd: 100, label: "50% to 100%" });
    bins.push({ rangeStart: 100, rangeEnd: 200, label: "100% to 200%" });
  } else {
    // Many very high values: add 200+ overflow
    bins.push({ rangeStart: 0, rangeEnd: 20, label: "0% to 20%" });
    bins.push({ rangeStart: 20, rangeEnd: 50, label: "20% to 50%" });
    bins.push({ rangeStart: 50, rangeEnd: 100, label: "50% to 100%" });
    bins.push({ rangeStart: 100, rangeEnd: 200, label: "100% to 200%" });
    bins.push({
      rangeStart: 200,
      rangeEnd: Number.POSITIVE_INFINITY,
      label: "> 200%",
    });
  }

  return bins;
};

// Build bucket definitions for histogram X-axis (dynamic)
const buildBuckets = (data: CompanyBudgetData[]) =>
  buildDynamicBins(data.map((d) => d.budgetPercent));

export function MeetsParisVisualization({
  companies,
  onCompanyClick,
}: MeetsParisVisualizationProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("histogram");
  const [colorMode, setColorMode] = useState<ColorMode>("range");
  const [hoveredGroup, setHoveredGroup] = useState<CompanyGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalGroup, setModalGroup] = useState<CompanyGroup | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const sectorNames = useSectorNames();

  // Calculate budget percentages for all companies, excluding unknowns (null)
  const companyBudgetData: CompanyBudgetData[] = useMemo(() => {
    return companies
      .map((company) => {
        const trendAnalysis = calculateTrendline(company);
        const budgetPercent = calculateCarbonBudgetPercent(
          company,
          trendAnalysis,
        );
        if (budgetPercent === null) return null;
        return {
          company,
          budgetPercent,
          meetsParis: company.meetsParis ?? null,
        };
      })
      .filter((d): d is CompanyBudgetData => d !== null);
  }, [companies]);

  // Build dynamic bins from data
  const buckets = useMemo(
    () => buildBuckets(companyBudgetData),
    [companyBudgetData],
  );

  // Group data into buckets; width = count
  const groups: CompanyGroup[] = useMemo(() => {
    if (companyBudgetData.length === 0) return [];

    return buckets.map(({ rangeStart, rangeEnd, label }, idx) => {
      const inBucket = companyBudgetData.filter((d) => {
        const v = d.budgetPercent;
        if (!Number.isFinite(rangeStart)) return v < -100; // <-100%
        if (!Number.isFinite(rangeEnd)) return v > 100; // >100%
        return v >= rangeStart && v < rangeEnd;
      });

      const avg = inBucket.length
        ? inBucket.reduce((s, d) => s + d.budgetPercent, 0) / inBucket.length
        : 0;

      return {
        key: `${label}_${idx}`,
        rangeStart,
        rangeEnd,
        companies: inBucket,
        averagePercent: avg,
      };
    });
  }, [companyBudgetData, buckets]);

  const totalCountMax = useMemo(() => {
    return Math.max(...groups.map((g) => g.companies.length), 1);
  }, [groups]);

  // Generate nice tick marks for counts (0..max) for bottom axis
  const countTicks = useMemo(() => {
    const max = Math.max(...groups.map((g) => g.companies.length), 0);
    if (max === 0) return [0];
    const niceStep = (rough: number) => {
      const pow10 = Math.pow(10, Math.floor(Math.log10(rough)));
      const base = rough / pow10;
      const niceBase = base <= 1 ? 1 : base <= 2 ? 2 : base <= 5 ? 5 : 10;
      return niceBase * pow10;
    };
    const desired = 5; // target tick count
    const step = niceStep(Math.ceil(max / desired));
    const niceMax = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = 0; v <= niceMax; v += step) ticks.push(v);
    return ticks;
  }, [groups]);

  // Color function: range-based (default) or statistical
  const budgetValues = useMemo(
    () => companyBudgetData.map((d) => d.budgetPercent),
    [companyBudgetData],
  );

  const colorForPercent: ColorFunction = useMemo(() => {
    if (colorMode === "statistical") {
      return (value: number) =>
        createStatisticalGradient(budgetValues, value, false); // lower is better
    }
    return (value: number) => createFixedRangeGradient(-100, 100, value);
  }, [colorMode, budgetValues]);

  // Group companies by industry for sunburst chart
  const industries = useMemo(() => {
    return groupCompaniesByIndustry(companyBudgetData, (d) =>
      getCompanySectorName(d.company, sectorNames),
    );
  }, [companyBudgetData, sectorNames]);

  const noBudgetCompanies = useMemo(() => {
    return companies.filter((c) => {
      const trendAnalysis = calculateTrendline(c);
      const budgetPercent = calculateCarbonBudgetPercent(c, trendAnalysis);
      return budgetPercent === null;
    });
  }, [companies]);

  // Tooltip formatter for sunburst
  const tooltipFormatter = useMemo(() => {
    return createSunburstTooltipFormatter({
      formatSectorValue: (value: number) => {
        return `${value < 0 ? "Under" : "Over"} ${Math.abs(value).toFixed(1)}%`;
      },
      formatCompanyValue: (value: number) => {
        return `${value < 0 ? "Under budget" : "Over budget"}: ${Math.abs(value).toFixed(1)}%`;
      },
      getCompanyName: (data: any) => {
        const budgetData = data.item as CompanyBudgetData | undefined;
        return data.companyName || budgetData?.company?.name || "";
      },
      getValue: (data: any) => {
        return data.valueForColor ?? 0;
      },
    });
  }, []);

  if (mode === "sunburst" && companyBudgetData.length === 0) {
    return (
      <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-grey text-lg">
          {t("companies.list.insights.noData.metric", {
            metric: t("companies.list.kpis.meetsParis.label"),
          })}
        </p>
      </div>
    );
  }

  if (mode === "sunburst") {
    return (
      <div className="bg-black-2 rounded-level-2 p-4 md:p-6 h-full flex flex-col relative">
        <div className="flex items-center justify-between mb-4">
          <VisualizationModeSelector
            mode={mode}
            modes={[
              ["histogram", "Histogram"],
              ["sunburst", "Sunburst"],
            ]}
            onModeChange={setMode}
          />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setColorMode("range")}
              className={`px-3 py-1.5 text-xs rounded-level-1 border transition-colors ${
                colorMode === "range"
                  ? "bg-black-3 border-black-4 text-white"
                  : "bg-black-2 border-black-3 text-grey hover:bg-black-2/80"
              }`}
            >
              Range-based
            </button>
            <button
              onClick={() => setColorMode("statistical")}
              className={`px-3 py-1.5 text-xs rounded-level-1 border transition-colors ${
                colorMode === "statistical"
                  ? "bg-black-3 border-black-4 text-white"
                  : "bg-black-2 border-black-3 text-grey hover:bg-black-2/80"
              }`}
            >
              Statistical
            </button>
          </div>
        </div>
        <SunburstChart
          industries={industries}
          onCompanyClick={(budgetData) => onCompanyClick?.(budgetData.company)}
          colorForValue={colorForPercent}
          getValue={(d) => d.budgetPercent}
          getCompanyName={(d) => d.company.name}
          calculateAverage={(comps) =>
            comps.length > 0
              ? comps.reduce((sum, d) => sum + d.budgetPercent, 0) /
                comps.length
              : 0
          }
          tooltipFormatter={tooltipFormatter}
          excludedCount={noBudgetCompanies.length}
          excludedLabel="companies without budget data excluded"
          description={{
            title: "Inner ring: Industries | Outer ring: Companies",
            subtitle:
              "Color gradient: blue (under budget) → pink (over budget) based on budget deviation",
          }}
        />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-grey text-lg">
          {t("companies.list.insights.noData.metric", {
            metric: t("companies.list.kpis.meetsParis.label"),
          })}
        </p>
      </div>
    );
  }

  // Render histogram (X = bins, Y = count)
  return (
    <div className="bg-black-2 rounded-level-2 p-4 md:p-6 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-4">
        <VisualizationModeSelector
          mode={mode}
          modes={[
            ["histogram", "Histogram"],
            ["sunburst", "Sunburst"],
          ]}
          onModeChange={setMode}
        />
      </div>
      <p className="text-grey text-sm mb-4">
        Percent over or under each company's carbon budget. We estimate future
        emissions with an LAD trendline and compare cumulative 2025–2050
        emissions to a Carbon Law path (11.7% yearly reduction).{" "}
        <a
          href="/methodology?view=companyDataOverview"
          className="underline hover:text-white"
        >
          Learn more
        </a>
      </p>

      <div className="flex-1 overflow-auto relative">
        <div className="relative h-full min-h-[400px] pb-8">
          {/* Left labels: bin labels (top → bottom) */}
          <div className="absolute left-0 top-0 bottom-6 w-24">
            {groups.map((g, i) => {
              const rowHeight = 100 / Math.max(groups.length, 1);
              const top = i * rowHeight;
              const label = buckets[i]?.label ?? "";
              return (
                <div
                  key={g.key}
                  className="absolute text-xs text-grey flex items-center"
                  style={{ top: `${top}%`, height: `${rowHeight}%` }}
                >
                  <span className="pr-2 whitespace-nowrap">{label}</span>
                </div>
              );
            })}
          </div>

          {/* Bars area */}
          <div className="ml-28 mr-6 relative h-full">
            {/* Plot area wrapper to keep bars/bands above X ticks */}
            <div className="absolute left-0 right-0 top-0 bottom-6">
              {/* Region split helpers: top/bottom bands and 0% divider */}
              {(() => {
                // find first non-negative bin index (top height in %)
                const splitIndex = buckets.findIndex((b) => b.rangeStart >= 0);
                const topPercent =
                  (Math.max(0, splitIndex >= 0 ? splitIndex : 0) /
                    Math.max(buckets.length, 1)) *
                  100;
                return (
                  <>
                    {/* top (under) band */}
                    <div
                      className="absolute left-0 right-0 top-0 bg-blue-5/10"
                      style={{ height: `${topPercent}%` }}
                    />
                    {/* bottom (over) band */}
                    <div
                      className="absolute left-0 right-0 bottom-0 bg-pink-5/10"
                      style={{ height: `${100 - topPercent}%` }}
                    />
                    {/* horizontal divider at 0% */}
                    <div
                      className="absolute left-0 right-0 h-0.5 bg-white"
                      style={{ top: `${topPercent}%` }}
                    />
                  </>
                );
              })()}

              {/* Bars laid out across Y bins (row height), width = count */}
              <div className="absolute inset-0">
                {groups.map((group, i) => {
                  const count = group.companies.length;
                  const rowHeight = 100 / Math.max(groups.length, 1);
                  const top = i * rowHeight;
                  const barWidthPercent =
                    (count / Math.max(totalCountMax, 1)) * 100;
                  const backgroundColor = colorForPercent(group.averagePercent);
                  return (
                    <div
                      key={group.key}
                      className="absolute left-0"
                      style={{
                        top: `${top}%`,
                        height: `${rowHeight}%`,
                        width: "100%",
                      }}
                      onMouseEnter={(e) => {
                        setHoveredGroup(group);
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => {
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => {
                        setHoveredGroup(null);
                        setTooltipPos(null);
                      }}
                      onClick={() => {
                        setModalGroup(group);
                        setIsModalOpen(true);
                      }}
                    >
                      <div
                        className="my-1 h-[60%] rounded"
                        style={{
                          width: `${barWidthPercent}%`,
                          backgroundColor,
                          opacity: hoveredGroup === group ? 1 : 0.85,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom X-axis (count) ticks */}
            <div className="absolute left-0 right-0 bottom-0 h-5">
              {countTicks.map((v) => (
                <span
                  key={v}
                  className="absolute text-[10px] text-grey"
                  style={{
                    left: `${(v / Math.max(countTicks[countTicks.length - 1], 1)) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
            {/* Axis labels (outside plot) */}
            {/* Y-axis label on the left gutter, rotated */}
            <div
              className="absolute text-xs text-grey"
              style={{
                left: "-28px",
                top: "50%",
                transform: "rotate(-90deg)",
                transformOrigin: "left top",
              }}
            >
              Percent range
            </div>
            {/* X-axis label centered below ticks */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-14px] text-xs text-grey">
              Company count
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip (follows cursor, non-interactive) */}
      {hoveredGroup && tooltipPos && (
        <div
          className="fixed bg-black/80 backdrop-blur-sm p-4 rounded-2xl z-30 max-w-md max-h-[60vh] overflow-y-auto pointer-events-none"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}
        >
          <p className="text-white font-medium text-lg mb-2">
            {hoveredGroup.rangeStart === Number.NEGATIVE_INFINITY
              ? "<-100%"
              : hoveredGroup.rangeEnd === Number.POSITIVE_INFINITY
                ? ">100%"
                : `${hoveredGroup.rangeStart}% to ${hoveredGroup.rangeEnd}%`}
          </p>
          <p className="text-white/70 text-sm mb-3">
            {hoveredGroup.companies.length}{" "}
            {hoveredGroup.companies.length === 1 ? "company" : "companies"}
          </p>
          <div className="space-y-2">
            {hoveredGroup.companies
              .slice(0, 2)
              .map(({ company, budgetPercent, meetsParis }) => (
                <div
                  key={company.wikidataId}
                  className="rounded p-2 bg-white/5"
                >
                  <p className="text-white font-medium">{company.name}</p>
                  <div className="space-y-0.5 mt-1">
                    <p className="text-white/70 text-sm">
                      <span className="text-orange-2">
                        {meetsParis === true
                          ? t(
                              "companies.list.kpis.meetsParis.booleanLabels.true",
                            )
                          : meetsParis === false
                            ? t(
                                "companies.list.kpis.meetsParis.booleanLabels.false",
                              )
                            : t("companies.list.kpis.meetsParis.nullValues")}
                      </span>
                    </p>
                    <p className="text-white/70 text-xs">
                      {budgetPercent < 0
                        ? t(
                            "companies.list.visualizations.meetsParis.tooltip.underBudget",
                            "{{percent}}% under budget",
                            { percent: Math.abs(budgetPercent).toFixed(1) },
                          )
                        : t(
                            "companies.list.visualizations.meetsParis.tooltip.overBudget",
                            "{{percent}}% over budget",
                            { percent: budgetPercent.toFixed(1) },
                          )}
                    </p>
                  </div>
                </div>
              ))}
          </div>
          {hoveredGroup.companies.length > 2 && (
            <div className="mt-3 text-xs text-white/80">
              {t(
                "companies.list.visualizations.meetsParis.tooltip.showAll",
                "Click to show all ({{count}})",
                {
                  count: hoveredGroup.companies.length,
                },
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal listing all companies in the hovered bin */}
      {isModalOpen && modalGroup && (
        <div className="fixed inset-0 z-30 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-black/80 backdrop-blur-sm rounded-2xl p-4 max-w-md w-[90%] max-h-[80vh] overflow-y-auto border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white text-base font-semibold">
                {modalGroup.rangeStart === Number.NEGATIVE_INFINITY
                  ? "<-100%"
                  : modalGroup.rangeEnd === Number.POSITIVE_INFINITY
                    ? ">100%"
                    : `${modalGroup.rangeStart}% to ${modalGroup.rangeEnd}%`}{" "}
                — {modalGroup.companies.length}{" "}
                {modalGroup.companies.length === 1 ? "company" : "companies"}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                className="text-white/70 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {modalGroup.companies.map(
                ({ company, budgetPercent, meetsParis }) => (
                  <div
                    key={company.wikidataId}
                    className="cursor-pointer hover:bg-white/10 rounded p-2 transition-colors"
                    onClick={() => {
                      setIsModalOpen(false);
                      onCompanyClick?.(company);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium mr-3 truncate">
                        {company.name}
                      </p>
                      <span className="text-orange-2 text-xs">
                        {budgetPercent < 0
                          ? t(
                              "companies.list.visualizations.meetsParis.tooltip.underBudget",
                              "{{percent}}% under",
                              { percent: Math.abs(budgetPercent).toFixed(1) },
                            )
                          : t(
                              "companies.list.visualizations.meetsParis.tooltip.overBudget",
                              "{{percent}}% over",
                              { percent: budgetPercent.toFixed(1) },
                            )}
                      </span>
                    </div>
                    <div className="text-white/60 text-xs mt-1">
                      {meetsParis === true
                        ? t("companies.list.kpis.meetsParis.booleanLabels.true")
                        : meetsParis === false
                          ? t(
                              "companies.list.kpis.meetsParis.booleanLabels.false",
                            )
                          : t("companies.list.kpis.meetsParis.nullValues")}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-grey">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-3 rounded" />
          <span>
            {t(
              "companies.list.visualizations.meetsParis.underBudget",
              "Under Budget",
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-3 rounded" />
          <span>
            {t(
              "companies.list.visualizations.meetsParis.overBudget",
              "Over Budget",
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
