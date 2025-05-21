import { FC } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Area,
  Legend,
  Tooltip,
  ReferenceLine,
  Line,
  ComposedChart,
} from "recharts";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsoluteCompact } from "@/utils/localizeUnit";
import { SectorEmissions } from "@/types/municipality";
import { useMunicipalitySectors } from "@/hooks/useMunicipalitySectors";
import { CustomTooltip } from "./CustomTooltip";
import { useTranslation } from "react-i18next";

interface SectorsChartProps {
  sectorEmissions: SectorEmissions | null;
  hiddenSectors?: Set<string>;
  setHiddenSectors?: (sectors: Set<string>) => void;
  trendData?: Array<{ year: number; value: number }>;
  approximatedData?: Array<{ year: number; value: number }>;
  parisData?: Array<{ year: number; value: number }>;
}

export const SectorsChart: FC<SectorsChartProps> = ({
  sectorEmissions,
  hiddenSectors = new Set(),
  setHiddenSectors = () => {},
  trendData = [],
  approximatedData = [],
  parisData = [],
}) => {
  const { currentLanguage } = useLanguage();
  const { getSectorInfo } = useMunicipalitySectors();
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();
  const CUTOFF_YEAR = 2024; // No sector data should be shown from this year onwards

  const sectorYears = sectorEmissions
    ? Object.keys(sectorEmissions.sectors).map(Number)
    : [];

  const trendYears = trendData.map((point) => point.year);
  const approximatedYears = approximatedData.map((point) => point.year);
  const parisYears = parisData.map((point) => point.year);

  const allYears = [
    ...new Set([
      ...sectorYears,
      ...trendYears,
      ...approximatedYears,
      ...parisYears,
    ]),
  ].sort();

  const lastDataYear =
    sectorYears.length > 0 ? Math.max(...sectorYears) : currentYear;

  const allSectors = sectorEmissions
    ? [
        ...new Set(
          sectorYears.flatMap((year) =>
            Object.keys(sectorEmissions.sectors[year] || {}),
          ),
        ),
      ]
    : [];

  const chartData = allYears.map((year) => {
    const dataPoint: Record<string, number | string> = { year };

    // Only add sector data for years before CUTOFF_YEAR
    if (year < CUTOFF_YEAR) {
      const yearData = sectorEmissions?.sectors[year] || {};
      allSectors.forEach((sector) => {
        if (!hiddenSectors.has(sector)) {
          dataPoint[sector] = (yearData as Record<string, number>)[sector] || 0;
        }
      });
    }

    // Always add trend, approximated and paris data for all years
    const trendPoint = trendData.find((point) => point.year === year);
    if (trendPoint) {
      dataPoint.trend = trendPoint.value;
    }

    const approximatedPoint = approximatedData.find(
      (point) => point.year === year,
    );
    if (approximatedPoint) {
      dataPoint.approximated = approximatedPoint.value;
    }

    const parisPoint = parisData.find((point) => point.year === year);
    if (parisPoint) {
      dataPoint.paris = parisPoint.value;
    }

    return dataPoint;
  });

  // Include years up to 2050 for ticks if there's trend/paris data going that far
  const maxYear = Math.max(
    lastDataYear,
    ...trendYears,
    ...approximatedYears,
    ...parisYears,
  );

  const customTicks = [1990, 2015, 2020, currentYear, 2030, 2040, 2050]
    .filter((year) => year <= maxYear)
    .filter((year, i, arr) => arr.indexOf(year) === i)
    .sort();

  return (
    <ResponsiveContainer width="100%" height="90%">
      <ComposedChart data={chartData}>
        <Legend
          verticalAlign="bottom"
          align="right"
          height={36}
          iconType="line"
          wrapperStyle={{ fontSize: "12px", color: "var(--grey)" }}
          formatter={(value) => {
            if (value === "trend") {
              return t("municipalities.graph.trend");
            }
            if (value === "approximated") {
              return t("municipalities.graph.estimated");
            }
            if (value === "paris") {
              return t("municipalities.graph.paris");
            }
            const sectorInfo = getSectorInfo
              ? getSectorInfo(value)
              : { translatedName: value };
            return sectorInfo.translatedName;
          }}
          onClick={(data) => {
            if (
              ["trend", "approximated", "paris"].includes(
                data.dataKey as string,
              )
            )
              return;

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
          domain={[1990, maxYear]}
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
              <Area
                key={sector}
                type="monotone"
                dataKey={sector}
                stroke={sectorInfo.color}
                fillOpacity={0}
                stackId="1"
                strokeWidth={1}
                name={sector}
                connectNulls={true}
              />
            );
          })}
        <Line
          type="monotone"
          dataKey="approximated"
          stroke="white"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
          name="approximated"
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="trend"
          stroke="var(--pink-3)"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
          name="trend"
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="paris"
          stroke="var(--green-3)"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
          name="paris"
          connectNulls={true}
        />
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
      </ComposedChart>
    </ResponsiveContainer>
  );
};
