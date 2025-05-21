import { FC } from "react";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Line,
  Legend,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsoluteCompact } from "@/utils/localizeUnit";
import { SectorEmissions } from "@/types/municipality";
import { useMunicipalitySectors } from "@/hooks/useMunicipalitySectors";
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

  const years = sectorEmissions
    ? Object.keys(sectorEmissions.sectors).map(Number).sort()
    : [];

  const allSectors = sectorEmissions
    ? [
        ...new Set(
          years.flatMap((year) =>
            Object.keys(sectorEmissions.sectors[year] || {}),
          ),
        ),
      ]
    : [];

  const chartData = years.map((year) => {
    const yearData = sectorEmissions?.sectors[year] || {};

    const dataPoint: Record<string, number | string> = { year };

    allSectors.forEach((sector) => {
      if (!hiddenSectors.has(sector)) {
        dataPoint[sector] = (yearData as Record<string, number>)[sector] || 0;
      }
    });

    return dataPoint;
  });

  const currentYear = new Date().getFullYear();

  return (
    <ResponsiveContainer width="100%" height="90%">
      <LineChart data={chartData}>
        <Legend
          verticalAlign="bottom"
          align="right"
          height={36}
          iconType="line"
          wrapperStyle={{ fontSize: "12px", color: "var(--grey)" }}
          formatter={(value) => {
            const sectorInfo = getSectorInfo
              ? getSectorInfo(value)
              : { translatedName: value };
            return sectorInfo.translatedName;
          }}
          onClick={(data) => {
            const newHidden = new Set(hiddenSectors);
            if (newHidden.has(data.dataKey as string)) {
              newHidden.delete(data.dataKey as string);
            } else {
              newHidden.add(data.dataKey as string);
            }
            setHiddenSectors(newHidden);
          }}
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
          domain={[1990, 2050]}
          allowDuplicatedCategory={false}
          ticks={[1990, 2015, 2020, currentYear, 2030, 2040, 2050]}
          tickFormatter={(year) => year}
          type="number"
          scale="linear"
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
        {allSectors
          .filter((sector) => !hiddenSectors.has(sector))
          .map((sector) => {
            const sectorInfo = getSectorInfo
              ? getSectorInfo(sector)
              : {
                  color:
                    "#" + Math.floor(Math.random() * 16777215).toString(16),
                };
            return (
              <Line
                key={sector}
                type="monotone"
                dataKey={sector}
                stroke={sectorInfo.color}
                strokeWidth={2}
                dot={false}
                name={sector}
                connectNulls={true}
              />
            );
          })}
        <ReferenceLine
          x={currentYear}
          stroke="var(--orange-3)"
          strokeWidth={1}
          label={{
            value: currentYear,
            position: "top",
            fill: "var(--orange-3)",
            fontSize: 12,
            fontWeight: "normal",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
