import { useMemo, useState } from "react";
import type { CompanyWithKPIs } from "@/types/company";
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
import { BeeswarmChart } from "./shared/BeeswarmChart";
import { createSunburstTooltipFormatter } from "./shared/sunburstTooltips";
import type { ColorFunction } from "@/types/visualizations";

type Mode = "beeswarm" | "sunburst";
type ColorMode = "range" | "statistical";

interface EmissionsChangeVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

export function EmissionsChangeVisualization({
  companies,
  onCompanyClick,
}: EmissionsChangeVisualizationProps) {
  const [mode, setMode] = useState<Mode>("beeswarm");
  const [colorMode, setColorMode] = useState<ColorMode>("range");
  const sectorNames = useSectorNames();

  const { valid: withData, invalid: noData } = useMemo(
    () =>
      filterValidNumericData(companies, (c) => c.emissionsChangeFromBaseYear),
    [companies],
  );

  const values = useMemo(
    () => withData.map((c) => c.emissionsChangeFromBaseYear as number),
    [withData],
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
    return groupCompaniesByIndustry(withData, (c) =>
      getCompanySectorName(c, sectorNames),
    );
  }, [withData, sectorNames]);

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
        return `${value < 0 ? "Reduction" : "Increase"} ${Math.abs(value).toFixed(1)}%`;
      },
      formatCompanyValue: (value: number) => {
        return `${value < 0 ? "Reduction" : "Increase"}: ${Math.abs(value).toFixed(1)}%`;
      },
      getCompanyName: (data: any) => {
        return data.companyName || data.item?.name || "";
      },
      getValue: (data: any) => {
        return data.valueForColor ?? 0;
      },
    });
  }, []);

  if (mode === "sunburst" && withData.length === 0) {
    return (
      <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-grey text-lg">No data available</p>
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
              ["beeswarm", "Beeswarm"],
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
          onCompanyClick={onCompanyClick}
          colorForValue={colorForValue}
          getValue={(c) => c.emissionsChangeFromBaseYear as number}
          getCompanyName={(c) => c.name}
          calculateAverage={(comps) =>
            comps.length > 0
              ? comps.reduce(
                  (sum, c) => sum + (c.emissionsChangeFromBaseYear as number),
                  0,
                ) / comps.length
              : 0
          }
          tooltipFormatter={tooltipFormatter}
          excludedCount={noData.length}
          excludedLabel="companies without base year data excluded"
          description={{
            title: "Inner ring: Industries | Outer ring: Companies",
            subtitle:
              "Color gradient: blue (reduction) → pink (increase) based on change from base year",
          }}
        />
      </div>
    );
  }

  // Beeswarm visualization
  if (withData.length === 0) {
    return (
      <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-grey text-lg">No data available</p>
      </div>
    );
  }

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
          Emissions Change from Base Year
          {" · "}
          Unknown: {noData.length}
        </div>
      </div>

      <div className="relative flex-1 bg-black-2 rounded-level-2 p-4 overflow-auto">
        {mode === "beeswarm" && (
          <BeeswarmChart
            data={withData}
            getValue={(c) => c.emissionsChangeFromBaseYear as number}
            getCompanyName={(c) => c.name}
            getCompanyId={(c) => c.wikidataId}
            colorForValue={colorForValue}
            min={min}
            max={max}
            unit="%"
            onCompanyClick={onCompanyClick}
          />
        )}
      </div>
    </div>
  );
}
