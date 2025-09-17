import { FC, useMemo } from "react";
import {
  ComposedChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import { SectorEmissions } from "@/types/municipality";
import { useMunicipalitySectors } from "@/hooks/municipalities/useMunicipalitySectors";
import {
  DynamicLegendContainer,
  LegendItem,
  createSectorLegendItems,
  LEGEND_CONTAINER_CONFIGS,
  getXAxisProps,
  getYAxisProps,
  getChartContainerProps,
  getComposedChartProps,
  getResponsiveChartMargin,
  ChartWrapper,
  ChartArea,
  ChartFooter,
  getCurrentYearReferenceLineProps,
  ChartTooltip,
} from "@/components/charts";
import { XAxis, YAxis } from "recharts";

interface SectorsChartProps {
  sectorEmissions: SectorEmissions | null;
  hiddenSectors?: Set<string>;
  setHiddenSectors?: (sectors: Set<string>) => void;
}

export const SectorsChart: FC<SectorsChartProps> = ({
  sectorEmissions,
  hiddenSectors = new Set(),
  setHiddenSectors = () => {},
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const { getSectorInfo } = useMunicipalitySectors();

  const MAX_YEAR = new Date().getFullYear() + 5;
  const CUTOFF_YEAR = new Date().getFullYear() - 1;

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

    const ticks = [1990, 2015, 2020, new Date().getFullYear(), MAX_YEAR]
      .filter((year) => year <= MAX_YEAR)
      .filter((year, i, arr) => arr.indexOf(year) === i)
      .sort();

    return { chartData: data, allSectors: sectors, customTicks: ticks };
  }, [sectorEmissions, hiddenSectors, MAX_YEAR, CUTOFF_YEAR]);

  // Create legend items using shared utility
  const legendItems: LegendItem[] = useMemo(() => {
    return createSectorLegendItems(allSectors, hiddenSectors, getSectorInfo);
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
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <ComposedChart
            {...getComposedChartProps(
              chartData,
              undefined,
              getResponsiveChartMargin(isMobile),
            )}
          >
            <XAxis
              {...getXAxisProps("year", [1990, MAX_YEAR], customTicks)}
              allowDuplicatedCategory={true}
              tickFormatter={(year) => year}
            />
            <YAxis {...getYAxisProps(currentLanguage)} />

            <Tooltip
              content={
                <ChartTooltip
                  dataView="sectors"
                  hiddenSectors={hiddenSectors}
                  unit={t("emissionsUnit")}
                />
              }
              wrapperStyle={{ outline: "none" }}
            />

            {/* Current year reference line */}
            <ReferenceLine {...getCurrentYearReferenceLineProps(MAX_YEAR, t)} />

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
                  strokeWidth={isHidden ? 0 : 2}
                  name={sector}
                  connectNulls={true}
                  style={{ cursor: "pointer", opacity: isHidden ? 0.4 : 1 }}
                  hide={isHidden}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </ChartArea>

      <ChartFooter>
        <DynamicLegendContainer
          items={legendItems}
          onItemToggle={handleLegendToggle}
          {...LEGEND_CONTAINER_CONFIGS.sectors}
        />
      </ChartFooter>
    </ChartWrapper>
  );
};
