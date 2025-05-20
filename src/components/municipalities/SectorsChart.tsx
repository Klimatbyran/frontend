import { FC } from "react";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Line,
  Legend,
  Tooltip,
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

  const latestYearWithSectorData = sectorEmissions
    ? Math.max(...Object.keys(sectorEmissions.sectors).map(Number))
    : null;

  const sectorData =
    latestYearWithSectorData && sectorEmissions
      ? sectorEmissions.sectors[latestYearWithSectorData]
      : null;

  const chartData =
    latestYearWithSectorData && sectorData
      ? Object.entries(sectorData)
          .filter(([sector]) => !hiddenSectors.has(sector))
          .map(([sector, value]) => ({
            year: latestYearWithSectorData,
            [sector]: value,
          }))
      : [];

  return (
    <ResponsiveContainer width="100%" height="90%">
      <LineChart data={chartData}>
        <Legend
          verticalAlign="bottom"
          align="right"
          height={36}
          iconType="line"
          wrapperStyle={{ fontSize: "12px", color: "#878787" }}
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
          stroke="#878787"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          padding={{ left: 0, right: 0 }}
        />
        <YAxis
          stroke="#878787"
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
        {sectorData &&
          Object.keys(sectorData)
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
                  dot={{ r: 4, fill: sectorInfo.color }}
                  activeDot={{ r: 6 }}
                  name={sector}
                />
              );
            })}
      </LineChart>
    </ResponsiveContainer>
  );
};
