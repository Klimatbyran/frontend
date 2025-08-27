import { FC, useMemo } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Area,
  Legend,
  Tooltip,
  ComposedChart,
} from "recharts";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";
import { SectorEmissions } from "@/types/municipality";
import { useMunicipalitySectors } from "@/hooks/municipalities/useMunicipalitySectors";
import { CustomTooltip } from "./CustomTooltip";

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

  const handleLegendClick = (data: { dataKey: string | number }) => {
    const newHidden = new Set(hiddenSectors);
    const key = data.dataKey as string;

    if (newHidden.has(key)) {
      newHidden.delete(key);
    } else {
      newHidden.add(key);
    }

    setHiddenSectors(newHidden);
  };

  const handleAreaClick = (sector: string) => {
    const newHidden = new Set(hiddenSectors);

    if (newHidden.has(sector)) {
      newHidden.delete(sector);
    } else {
      newHidden.add(sector);
    }

    setHiddenSectors(newHidden);
  };

  return (
    <ResponsiveContainer width="100%" height="90%">
      <ComposedChart data={chartData} margin={{ left: -50 }}>
        <Legend
          verticalAlign="bottom"
          align="right"
          iconType="line"
          wrapperStyle={{ fontSize: "12px", color: "var(--grey)", paddingLeft: "50px" }}
          formatter={(value) => {
            const sectorInfo = getSectorInfo?.(value) || {
              translatedName: value,
            };
            const isHidden = hiddenSectors.has(value);
            return (
              <span
                style={{
                  color: isHidden ? "var(--grey)" : sectorInfo.color,
                  textDecoration: isHidden ? "line-through" : "none",
                  cursor: "pointer",
                }}
              >
                {sectorInfo.translatedName}
              </span>
            );
          }}
          onClick={(data) => handleLegendClick(data as { dataKey: string })}
        />
        <Tooltip
          content={
            <CustomTooltip dataView="sectors" hiddenSectors={hiddenSectors} />
          }
        />
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
          width={80}
          domain={[0, "auto"]}
          padding={{ top: 0, bottom: 0 }}
        />
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
              onClick={() => handleAreaClick(sector)}
              style={{ cursor: "pointer", opacity: isHidden ? 0.4 : 1 }}
              hide={isHidden}
            />
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
