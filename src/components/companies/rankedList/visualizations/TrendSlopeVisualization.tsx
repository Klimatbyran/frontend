import { useMemo, useState } from "react";
import type { CompanyWithKPIs } from "@/types/company";
import { t } from "i18next";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import {
  createSymmetricRangeGradient,
  createStatisticalGradient,
} from "@/utils/visualizations/colorGradients";
import {
  groupCompaniesByIndustry,
  getCompanySectorName,
} from "@/utils/data/industryGrouping";
import { filterValidNumericData } from "@/utils/data/filtering";
import { VisualizationModeSelector } from "./shared/VisualizationModeSelector";
import { SunburstChart } from "./shared/SunburstChart";
import { createSunburstTooltipFormatter } from "./shared/sunburstTooltips";
import type { ColorFunction } from "@/types/visualizations";

type Mode = "beeswarm" | "sunburst";
type ColorMode = "range" | "statistical";

interface TrendSlopeVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

export function TrendSlopeVisualization({
  companies,
  onCompanyClick,
}: TrendSlopeVisualizationProps) {
  const [mode, setMode] = useState<Mode>("beeswarm");
  const [colorMode, setColorMode] = useState<ColorMode>("range");
  const sectorNames = useSectorNames();

  const { valid: withTrend, invalid: noTrend } = useMemo(
    () => filterValidNumericData(companies, (c) => c.trendSlope),
    [companies],
  );

  const values = useMemo(
    () => withTrend.map((c) => c.trendSlope as number),
    [withTrend],
  );

  const min = useMemo(
    () => (values.length ? Math.min(...values) : 0),
    [values],
  );
  const max = useMemo(
    () => (values.length ? Math.max(...values) : 0),
    [values],
  );

  const industries = useMemo(() => {
    return groupCompaniesByIndustry(withTrend, (c) =>
      getCompanySectorName(c, sectorNames),
    );
  }, [withTrend, sectorNames]);

  // Color function: range-based (default) or statistical
  const colorForValue: ColorFunction = useMemo(() => {
    if (colorMode === "statistical") {
      return (value: number) => createStatisticalGradient(values, value, false); // lower is better
    }
    return (value: number) => createSymmetricRangeGradient(min, max, value);
  }, [colorMode, min, max, values]);

  // Tooltip formatter for sunburst
  const tooltipFormatter = useMemo(() => {
    return createSunburstTooltipFormatter({
      formatSectorValue: (value: number) => {
        return `${value < 0 ? "Reduction" : "Increase"} ${Math.abs(value).toFixed(1)}%/yr`;
      },
      formatCompanyValue: (value: number) => {
        return `${value < 0 ? "Reduction" : "Increase"}: ${Math.abs(value).toFixed(1)}%/yr`;
      },
      getCompanyName: (data: any) => {
        return data.companyName || data.item?.name || "";
      },
      getValue: (data: any) => {
        return data.valueForColor ?? 0;
      },
    });
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <VisualizationModeSelector
          mode={mode}
          modes={[
            ["beeswarm", "Beeswarm"],
            ["sunburst", "Sunburst"],
          ]}
          onModeChange={setMode}
        />
        <div className="text-sm text-grey">
          {t("companies.list.kpis.trendSlope.label", "Emissions Trend (slope)")}
          {" · "}
          {t("companies.list.kpis.meetsParis.nullValues", "Unknown")}:{" "}
          {noTrend.length}
        </div>
      </div>

      <div className="relative flex-1 bg-black-2 rounded-level-2 p-4 overflow-auto">
        {mode === "beeswarm" && (
          <div className="relative w-full h-[500px] flex flex-col">
            {/* X-axis labels */}
            <div className="flex justify-between mb-2 text-xs text-grey px-1">
              <span>{min.toFixed(1)}%/yr</span>
              <span className="font-medium">0%/yr</span>
              <span>{max.toFixed(1)}%/yr</span>
            </div>

            {/* Main visualization area */}
            <div className="relative flex-1 border-t border-b border-black-4">
              {/* Zero line (vertical) - only show if 0 is within data range */}
              {min <= 0 && max >= 0 && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-black-4 z-0"
                  style={{
                    left:
                      max === min
                        ? "50%"
                        : `${((0 - min) / (max - min)) * 100}%`,
                  }}
                />
              )}

              {/* Dots */}
              <div className="relative w-full h-full">
                {withTrend.slice(0, 600).map((c, i) => {
                  const v = c.trendSlope as number;
                  const xPercent =
                    max === min ? 50 : ((v - min) / (max - min)) * 100;
                  // Better jitter: spread dots vertically around their X position
                  // Use a hash of the index for consistent positioning
                  const hash = (i * 137.5) % 360;
                  const yJitter = Math.sin((hash * Math.PI) / 180) * 180; // -180 to +180px from center
                  const spread = Math.min(Math.abs(yJitter) / 10, 40); // Limit spread to 40px max
                  const yOffset = yJitter > 0 ? spread : -spread;

                  return (
                    <div
                      key={c.wikidataId}
                      title={`${c.name}: ${v.toFixed(1)}%/yr`}
                      onClick={() => onCompanyClick?.(c)}
                      className="absolute rounded-full cursor-pointer hover:scale-150 transition-transform z-10"
                      style={{
                        left: `calc(${xPercent}% - 8px)`,
                        top: `calc(50% + ${yOffset}px)`,
                        width: "16px",
                        height: "16px",
                        background: colorForValue(v),
                        border: "2px solid var(--black-4)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-2 text-xs text-grey text-center">
              {withTrend.length} companies shown
              {withTrend.length >= 600 && ` (showing first 600)`}
            </div>
          </div>
        )}

        {mode === "sunburst" && (
          <div className="w-full h-full flex flex-col">
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
              onCompanyClick={onCompanyClick}
              colorForValue={colorForValue}
              getValue={(c) => c.trendSlope as number}
              getCompanyName={(c) => c.name}
              calculateAverage={(comps) =>
                comps.length > 0
                  ? comps.reduce(
                      (sum, c) => sum + (c.trendSlope as number),
                      0,
                    ) / comps.length
                  : 0
              }
              tooltipFormatter={tooltipFormatter}
              excludedCount={noTrend.length}
              excludedLabel="companies without trend data excluded"
              description={{
                title: "Inner ring: Industries | Outer ring: Companies",
                subtitle:
                  "Size represents magnitude of change | Color: blue (reduction) to pink (increase)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
