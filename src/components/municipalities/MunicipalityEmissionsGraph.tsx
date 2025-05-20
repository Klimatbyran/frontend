import { FC } from "react";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Line,
  Area,
  Legend,
  Tooltip,
  TooltipProps,
  ReferenceLine,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatEmissionsAbsoluteCompact,
} from "@/utils/localizeUnit";
import { SectorEmissions } from "@/types/municipality";

interface DataPoint {
  year: number;
  total?: number;
  trend?: number;
  paris?: number;
  gap?: number;
  approximated?: number;
}

interface MunicipalityEmissionsGraphProps {
  projectedData: DataPoint[];
  sectorEmissions?: SectorEmissions;
}

export const MunicipalityEmissionsGraph: FC<
  MunicipalityEmissionsGraphProps
> = ({ projectedData }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const { currentLanguage } = useLanguage();

  if (!projectedData || projectedData.length === 0) {
    return <div>{t("municipalities.graph.noData")}</div>;
  }

  const CustomTooltip: FC<TooltipProps<number, string>> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      const hasActual = payload.some(
        (entry) => entry.dataKey === "total" && entry.value != null,
      );
      // Filter out approximated if actual exists for this year
      const filteredPayload = hasActual
        ? payload.filter((entry) => entry.dataKey !== "approximated")
        : payload;
      const isApproximated = filteredPayload.some(
        (entry) => entry.dataKey === "approximated" && entry.value != null,
      );
      // If approximated is present, only show that value (hide trend and paris)
      const displayPayload = isApproximated
        ? filteredPayload.filter((entry) => entry.dataKey === "approximated")
        : filteredPayload;
      return (
        <div className="bg-black-1 px-4 py-3 rounded-level-2">
          <div className="text-sm font-medium mb-2">{label}</div>
          {displayPayload.map((entry) => {
            if (entry.dataKey === "gap") {
              return null;
            }
            return (
              <div key={entry.dataKey} className="text-sm">
                <span className="text-grey mr-2">
                  {t(`municipalities.graph.${entry.dataKey}`)}:
                </span>
                <span style={{ color: entry.color }}>
                  {formatEmissionsAbsolute(
                    entry.value as number,
                    currentLanguage,
                  )}{" "}
                  {t("emissionsUnit")}
                </span>
              </div>
            );
          })}
          {isApproximated && (
            <div className="text-xs text-blue-2 mt-2">
              {t("municipalities.graph.estimatedValue")}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[400px] pr-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={projectedData}>
          <Legend
            verticalAlign="bottom"
            align="right"
            height={36}
            iconType="line"
            wrapperStyle={{ fontSize: "12px", color: "#878787" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <XAxis
            dataKey="year"
            stroke="#878787"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            padding={{ left: 0, right: 0 }}
            domain={[1990, 2050]}
            allowDuplicatedCategory={true}
            ticks={[1990, 2015, 2020, currentYear, 2030, 2040, 2050]}
            tickFormatter={(year) => year}
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
          <Area
            type="monotone"
            dataKey="gap"
            fill="rgba(240, 117, 154, 0.1)"
            stroke="none"
            fillOpacity={0.3}
            activeDot={false}
            name={t("municipalities.graph.gap")}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="white"
            strokeWidth={2}
            dot={false}
            connectNulls
            name={t("municipalities.graph.historical")}
          />
          <Line
            type="monotone"
            dataKey="approximated"
            stroke="white"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            connectNulls
            name={t("municipalities.graph.estimated")}
          />
          <Line
            type="monotone"
            dataKey="trend"
            stroke="#F0759A"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            name={t("municipalities.graph.trend")}
          />
          <Line
            type="monotone"
            dataKey="paris"
            stroke="#E2FF8D"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            name={t("municipalities.graph.parisAgreement")}
          />
          <ReferenceLine
            x={currentYear}
            stroke="#FDB768"
            strokeWidth={1}
            label={{
              value: currentYear,
              position: "top",
              fill: "#FDB768",
              fontSize: 12,
              fontWeight: "normal",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
