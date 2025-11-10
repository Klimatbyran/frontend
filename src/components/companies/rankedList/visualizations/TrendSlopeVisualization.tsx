import { useMemo, useState } from "react";
import type { CompanyWithKPIs } from "@/types/company";
import { t } from "i18next";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import {
  createSymmetricRangeGradient,
  createStatisticalGradient,
} from "@/utils/ui/colorGradients";
import {
  groupCompaniesByIndustry,
  getCompanySectorName,
} from "@/utils/data/industryGrouping";
import { filterValidNumericData } from "@/utils/data/filtering";
import { VisualizationModeSelector } from "./shared/VisualizationModeSelector";
import { SunburstChart } from "./shared/SunburstChart";
import { BeeswarmChart } from "./shared/BeeswarmChart";
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
          {t("companies.list.kpis.trendSlope.label", "Emissions Trend")}
          {" · "}
          {t("companies.list.kpis.meetsParis.nullValues", "Unknown")}:{" "}
          {noTrend.length}
        </div>
      </div>

      <div className="relative flex-1 bg-black-2 rounded-level-2 p-4 overflow-auto">
        {mode === "beeswarm" && (
          <BeeswarmChart
            data={withTrend}
            getValue={(c) => c.trendSlope as number}
            getCompanyName={(c) => c.name}
            getCompanyId={(c) => c.wikidataId}
            colorForValue={colorForValue}
            min={min}
            max={max}
            unit="/yr"
            onCompanyClick={onCompanyClick}
            xReferenceLines={[
              {
                value: -11.72,
                label: "Carbon Law (-11.72%)",
                color: "rgba(255, 255, 255, 0.5)",
              },
            ]}
          />
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
