import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CustomTooltip } from "../CustomTooltip";
import { ChartData } from "@/types/emissions";
import { t } from "i18next";
import { formatEmissionsAbsoluteCompact } from "@/utils/localizeUnit";

interface EmissionsLineChartProps {
  data: ChartData[];
  companyBaseYear?: number;
  dataView: "overview" | "scopes" | "categories";
  hiddenScopes: Array<"scope1" | "scope2" | "scope3">;
  hiddenCategories: number[];
  handleClick: (data: {
    activePayload?: Array<{
      payload: {
        year: number;
        total: number;
      };
    }>;
  }) => void;
  handleScopeToggle: (scope: "scope1" | "scope2" | "scope3") => void;
  handleCategoryToggle: (categoryId: number) => void;
  getCategoryName: (id: number) => string;
  getCategoryColor: (id: number) => string;
  currentLanguage: "sv" | "en";
}

export default function EmissionsLineChart({
  data,
  companyBaseYear,
  dataView,
  hiddenScopes,
  hiddenCategories,
  handleClick,
  handleScopeToggle,
  handleCategoryToggle,
  getCategoryName,
  getCategoryColor,
  currentLanguage,
}: EmissionsLineChartProps) {
  console.log(data);
  return (
    <ResponsiveContainer width="100%" height="100%" className="w-full">
      <LineChart
        data={data}
        margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
        onClick={handleClick}
      >
        <ReferenceLine
          label={{
            value: t("companies.emissionsHistory.baseYear"),
            position: "top",
            fill: "white",
            fontSize: 12,
            fontWeight: "normal",
          }}
          x={companyBaseYear}
          stroke="var(--grey)"
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey="year"
          stroke="var(--grey)"
          tickLine={false}
          axisLine={true}
          tick={({ x, y, payload }) => {
            const isBaseYear = payload.value === companyBaseYear;
            return (
              <text
                x={x - 15}
                y={y + 10}
                fontSize={12}
                fill={`${isBaseYear ? "white" : "var(--grey)"}`}
                fontWeight={`${isBaseYear ? "bold" : "normal"}`}
              >
                {payload.value}
              </text>
            );
          }}
          padding={{ left: 0, right: 0 }}
        />
        <YAxis
          stroke="#878787"
          tickLine={false}
          axisLine={true}
          tick={{ fontSize: 12 }}
          width={40}
          domain={[0, "auto"]}
          padding={{ top: 0, bottom: 0 }}
          tickFormatter={(value) =>
            formatEmissionsAbsoluteCompact(value, currentLanguage)
          }
        />
        <Tooltip
          content={<CustomTooltip companyBaseYear={companyBaseYear} />}
        />

        {dataView === "overview" && (
          <>
            <Line
              type="monotone"
              dataKey="total"
              stroke="white"
              strokeWidth={2}
              dot={{ r: 4, fill: "white", cursor: "pointer" }}
              activeDot={{ r: 6, fill: "white", cursor: "pointer" }}
              connectNulls
              name={t("companies.emissionsHistory.totalEmissions")}
            />
          </>
        )}
        {dataView === "scopes" && (
          <>
            {!hiddenScopes.includes("scope1") && (
              <Line
                type="monotone"
                dataKey="scope1.value"
                stroke="var(--pink-3)"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "var(--pink-3)",
                  cursor: "pointer",
                  onClick: () => handleScopeToggle("scope1"),
                }}
                activeDot={{
                  r: 6,
                  fill: "var(--pink-3)",
                  cursor: "pointer",
                }}
                name="Scope 1"
              />
            )}
            {!hiddenScopes.includes("scope2") && (
              <Line
                type="monotone"
                dataKey="scope2.value"
                stroke="var(--green-2)"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "var(--green-2)",
                  cursor: "pointer",
                  onClick: () => handleScopeToggle("scope2"),
                }}
                activeDot={{
                  r: 6,
                  fill: "var(--green-2)",
                  cursor: "pointer",
                }}
                name="Scope 2"
              />
            )}
            {!hiddenScopes.includes("scope3") && (
              <Line
                type="monotone"
                dataKey="scope3.value"
                stroke="var(--blue-2)"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "var(--blue-2)",
                  cursor: "pointer",
                  onClick: () => handleScopeToggle("scope3"),
                }}
                activeDot={{
                  r: 6,
                  fill: "var(--blue-2)",
                  cursor: "pointer",
                  onClick: () => handleScopeToggle("scope3"),
                }}
                name="Scope 3"
              />
            )}
          </>
        )}

        {dataView === "categories" &&
          Object.keys(data[0])
            .filter(
              (key) => key.startsWith("cat") && !key.includes("Interpolated"),
            )
            .map((categoryKey) => {
              const categoryId = parseInt(categoryKey.replace("cat", ""));
              const isInterpolatedKey = `${categoryKey}Interpolated`;

              // Check if the category is hidden
              if (hiddenCategories.includes(categoryId)) {
                return null;
              }
              // Calculate strokeDasharray based on the first data point
              const strokeDasharray = data[0][isInterpolatedKey] ? "4 4" : "0";

              return (
                <Line
                  key={categoryKey}
                  type="monotone"
                  dataKey={categoryKey}
                  stroke={getCategoryColor(categoryId)}
                  strokeWidth={2}
                  strokeDasharray={strokeDasharray}
                  dot={(props) => {
                    const { cx, cy, payload } = props;

                    if (!payload) {
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={0}
                          className="stroke-2 cursor-pointer"
                        />
                      );
                    }

                    const value = payload.originalValues?.[categoryKey];

                    if (value === null || value === undefined || isNaN(value)) {
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={0}
                          className="stroke-2 cursor-pointer"
                        />
                      );
                    }

                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        className="stroke-2 cursor-pointer"
                        style={{
                          fill: getCategoryColor(categoryId),
                          stroke: getCategoryColor(categoryId),
                        }}
                        cursor="pointer"
                        onClick={() => handleCategoryToggle(categoryId)}
                      />
                    );
                  }}
                  activeDot={(props) => {
                    const { cx, cy, payload } = props;

                    if (!payload) {
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={0}
                          className="stroke-2 cursor-pointer"
                        />
                      );
                    }

                    const value = payload.originalValues?.[categoryKey];

                    if (value === null || value === undefined || isNaN(value)) {
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={0}
                          className="stroke-2 cursor-pointer"
                        />
                      );
                    }

                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        className="stroke-2 cursor-pointer"
                        style={{
                          fill: getCategoryColor(categoryId),
                          stroke: getCategoryColor(categoryId),
                        }}
                        cursor="pointer"
                        onClick={() => handleCategoryToggle(categoryId)}
                      />
                    );
                  }}
                  name={getCategoryName(categoryId)}
                />
              );
            })}
      </LineChart>
    </ResponsiveContainer>
  );
}
