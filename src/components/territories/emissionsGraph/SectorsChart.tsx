import { FC, useMemo } from "react";
import {
  ComposedChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import { SectorEmissions } from "@/types/emissions";
import { useSectors } from "@/hooks/territories/useSectors";
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
  const { getSectorInfo } = useSectors();

  const MAX_YEAR = new Date().getFullYear() + 5;
  const CUTOFF_YEAR = new Date().getFullYear() - 1;

  const { chartData, allSectors, customTicks } = useMemo(() => {
    if (!sectorEmissions) {
      return { chartData: [], allSectors: [], customTicks: [] };
    }

    const sectorYears = Object.keys(sectorEmissions.sectors).map(Number);
    const allYears = [...new Set(sectorYears)]
      .sort()
      .filter((year) => year <= MAX_YEAR);

    // Get all unique sectors from all years
    const allUniqueSectors = [
      ...new Set(
        sectorYears.flatMap((year) =>
          Object.keys(sectorEmissions.sectors[year] || {}),
        ),
      ),
    ];

    // Process data and filter sectors in one pass
    const data = allYears.map((year) => {
      const dataPoint: Record<string, number | string> = { year };
      const yearData = sectorEmissions.sectors[year] || {};

      if (year < CUTOFF_YEAR) {
        allUniqueSectors.forEach((sector) => {
          if (!hiddenSectors.has(sector)) {
            const value = (yearData as Record<string, number>)[sector];
            if (value && value > 0) {
              dataPoint[sector] = value;
            }
          }
        });
      }

      return dataPoint;
    });

    // Get sectors that have non-zero data in the original data (for legend)
    const sectorsWithData = allUniqueSectors.filter((sector) => {
      return sectorYears.some((year) => {
        const yearData = sectorEmissions.sectors[year] || {};
        return (yearData as Record<string, number>)[sector] > 0;
      });
    });

    const ticks = [1990, 2015, 2020, new Date().getFullYear(), MAX_YEAR]
      .filter((year) => year <= MAX_YEAR)
      .filter((year, i, arr) => arr.indexOf(year) === i)
      .sort();

    return { chartData: data, allSectors: sectorsWithData, customTicks: ticks };
  }, [sectorEmissions, hiddenSectors, MAX_YEAR, CUTOFF_YEAR]);

  const legendItems: LegendItem[] = useMemo(() => {
    return createSectorLegendItems(allSectors, hiddenSectors, getSectorInfo);
  }, [allSectors, hiddenSectors, getSectorInfo]);

  const handleLegendToggle = (itemName: string) => {
    const sectorKey = allSectors.find((sector: string) => {
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
            key={`sectors-${Array.from(hiddenSectors).sort().join("-")}`}
            {...getComposedChartProps(
              chartData,
              undefined,
              getResponsiveChartMargin(isMobile),
            )}
          >
            <XAxis
              {...getXAxisProps("year", [1990, MAX_YEAR], customTicks)}
              allowDuplicatedCategory
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
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            <ReferenceLine {...getCurrentYearReferenceLineProps(MAX_YEAR)} />

            {/* Sector areas */}
            {allSectors.map((sector: string) => {
              const sectorInfo = getSectorInfo?.(sector) || {
                color: "#" + Math.floor(Math.random() * 16777215).toString(16),
                translatedName: sector,
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
                  strokeWidth={isHidden ? 0 : 2}
                  name={sectorInfo.translatedName}
                  connectNulls
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
