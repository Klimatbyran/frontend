import { FC, useMemo, useState } from "react";
import { ComposedChart, Area } from "recharts";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";
import { SectorEmissions } from "@/types/municipality";
import { useMunicipalitySectors } from "@/hooks/municipalities/useMunicipalitySectors";
import {
  ChartContainer,
  ChartTooltip,
  DynamicLegendContainer,
  LegendItem,
} from "@/components/charts";
import { XAxis, YAxis } from "recharts";

interface SectorsChartNewProps {
  sectorEmissions: SectorEmissions | null;
  hiddenSectors?: Set<string>;
  setHiddenSectors?: (sectors: Set<string>) => void;
}

export const SectorsChartNew: FC<SectorsChartNewProps> = ({
  sectorEmissions,
  hiddenSectors = new Set(),
  setHiddenSectors = () => {},
}) => {
  const { currentLanguage } = useLanguage();
  const { getSectorInfo } = useMunicipalitySectors();

  const MAX_YEAR = new Date().getFullYear();
  const CUTOFF_YEAR = MAX_YEAR - 1;

  const { chartData, allSectors, customTicks } = useMemo(() => {
    const sectorYears = sectorEmissions
      ? Object.keys(sectorEmissions.sectors).map(Number)
      : [];

    const allYears = [...new Set(sectorYears)]
      .sort()
      .filter((year) => year <= MAX_YEAR);

    const sectors = sectorEmissions
      ? [
          ...new Set(
            sectorYears.flatMap((year) =>
              Object.keys(sectorEmissions.sectors[year] || {}),
            ),
          ),
        ]
      : [];

    const data = allYears.map((year) => {
      const dataPoint: Record<string, number | string> = { year };

      if (year < CUTOFF_YEAR) {
        const yearData = sectorEmissions?.sectors[year] || {};
        sectors.forEach((sector) => {
          if (!hiddenSectors.has(sector)) {
            dataPoint[sector] =
              (yearData as Record<string, number>)[sector] || 0;
          }
        });
      }

      return dataPoint;
    });

    const ticks = [1990, 2015, 2020, MAX_YEAR]
      .filter((year) => year <= MAX_YEAR)
      .filter((year, i, arr) => arr.indexOf(year) === i)
      .sort();

    return { chartData: data, allSectors: sectors, customTicks: ticks };
  }, [sectorEmissions, hiddenSectors, MAX_YEAR, CUTOFF_YEAR]);

  // Create legend items for sectors
  const legendItems: LegendItem[] = useMemo(() => {
    return allSectors.map((sector) => {
      const sectorInfo = getSectorInfo?.(sector) || {
        translatedName: sector,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      };

      return {
        name: sectorInfo.translatedName,
        color: sectorInfo.color,
        isClickable: true,
        isHidden: hiddenSectors.has(sector),
      };
    });
  }, [allSectors, hiddenSectors, getSectorInfo]);

  const handleLegendToggle = (itemName: string) => {
    // Find the sector key that matches the translated name
    const sectorKey = allSectors.find((sector) => {
      const sectorInfo = getSectorInfo?.(sector);
      return sectorInfo?.translatedName === itemName;
    });

    if (sectorKey && setHiddenSectors) {
      const newHidden = new Set(hiddenSectors);
      if (newHidden.has(sectorKey)) {
        newHidden.delete(sectorKey);
      } else {
        newHidden.add(sectorKey);
      }
      setHiddenSectors(newHidden);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chart - fixed height to prevent shrinking */}
      <div className="h-[250px] md:h-[300px] w-full">
        <ChartContainer height="100%" width="100%">
          <ComposedChart
            data={chartData}
            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="year"
              stroke="var(--grey)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              padding={{ left: 0, right: 0 }}
              domain={[1990, MAX_YEAR]}
              allowDuplicatedCategory={true}
              ticks={customTicks}
              tickFormatter={(year) => year}
            />
            <YAxis
              stroke="var(--grey)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) =>
                formatEmissionsAbsoluteCompact(value, currentLanguage)
              }
              width={40}
              domain={[0, "auto"]}
              padding={{ top: 0, bottom: 0 }}
            />

            <ChartTooltip />

            {/* Sector areas */}
            {allSectors.map((sector) => {
              const sectorInfo = getSectorInfo?.(sector) || {
                color: "#" + Math.floor(Math.random() * 16777215).toString(16),
              };
              const isHidden = hiddenSectors.has(sector);
              const sectorColor = isHidden ? "var(--grey)" : sectorInfo.color;

              return (
                <Area
                  key={sector}
                  type="monotone"
                  dataKey={sector}
                  stroke={sectorColor}
                  fillOpacity={0}
                  stackId="1"
                  strokeWidth={isHidden ? 0 : 1}
                  name={sector}
                  connectNulls={true}
                  style={{ cursor: "pointer", opacity: isHidden ? 0.4 : 1 }}
                  hide={isHidden}
                />
              );
            })}
          </ComposedChart>
        </ChartContainer>
      </div>

      {/* Legend - scrollable if needed */}
      <div className="mt-4 min-h-0">
        <DynamicLegendContainer
          items={legendItems}
          onItemToggle={handleLegendToggle}
          showMetadata={false}
          allowClickToHide={true}
          maxHeight="200px"
          mobileMaxHeight="150px"
        />
      </div>
    </div>
  );
};
