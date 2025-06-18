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
import { useMemo } from "react";

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

const calculateLinearRegression = (data: { x: number; y: number }[]) => {
  const n = data.length;
  if (n < 2) {
    return null;
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const lastPoint = data[data.length - 1];
  const intercept = lastPoint.y - slope * lastPoint.x;

  return { slope, intercept };
};

const generateApproximatedData = (
  data: ChartData[],
  regression: { slope: number; intercept: number },
) => {
  const lastReportedYear = data
    .filter(
      (d): d is ChartData & { total: number } =>
        d.total !== undefined && d.total !== null,
    )
    .reduce((lastYear, d) => Math.max(lastYear, d.year), 0);

  const approximatedStartYear = data[0].year;
  const endYear = 2030;
  const currentYear = new Date().getFullYear();

  const currentYearApproximatedValue =
    regression.slope * currentYear + regression.intercept;

  const allYears = Array.from(
    { length: endYear - approximatedStartYear + 1 },
    (_, i) => approximatedStartYear + i,
  );

  const reductionRate = 0.1356;

  return allYears.map((year) => {
    const shouldShowApproximated = year >= lastReportedYear;
    const approximatedValue = shouldShowApproximated
      ? regression.slope * year + regression.intercept
      : null;

    return {
      year,
      approximated: year <= currentYear ? approximatedValue : null,
      total: data.find((d) => d.year === year)?.total,
      carbonLaw:
        year >= currentYear
          ? currentYearApproximatedValue *
            Math.pow(1 - reductionRate, year - currentYear)
          : null,
    };
  });
};

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
  const endYear = 2030;
  const currentYear = new Date().getFullYear();

  const approximatedData = useMemo(() => {
    if (dataView !== "overview") {
      return null;
    }

    const validPoints = data
      .filter(
        (d): d is ChartData & { total: number } =>
          d.total !== undefined && d.total !== null,
      )
      .map((d) => ({
        x: d.year,
        y: d.total,
      }))
      .slice(-2);

    if (validPoints.length < 2) {
      return null;
    }

    const regression = calculateLinearRegression(validPoints);
    if (!regression) {
      return null;
    }

    return generateApproximatedData(data, regression);
  }, [data, dataView]);

  return (
    <ResponsiveContainer width="100%" height="100%" className="w-full">
      <LineChart
        data={data}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
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
          isFront={false}
          ifOverflow="extendDomain"
        />

        <XAxis
          dataKey="year"
          stroke="var(--grey)"
          tickLine={false}
          axisLine={false}
          type="number"
          domain={[data[0]?.year || 2000, endYear]}
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
          stroke="var(--grey)"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={60}
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
            {approximatedData && (
              <>
                <ReferenceLine
                  x={currentYear}
                  stroke="var(--orange-2)"
                  strokeWidth={1}
                  label={{
                    value: currentYear,
                    position: "top",
                    fill: "var(--orange-2)",
                    fontSize: 12,
                    fontWeight: "normal",
                  }}
                />
                <Line
                  type="linear"
                  dataKey="approximated"
                  data={approximatedData}
                  stroke="var(--grey)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={false}
                  name={t("companies.emissionsHistory.approximated")}
                />
                <Line
                  type="monotone"
                  dataKey="carbonLaw"
                  data={approximatedData}
                  stroke="var(--green-3)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={false}
                  name={t("companies.emissionsHistory.carbonLaw")}
                />
              </>
            )}
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
                  activeDot={(props: {
                    cx?: number;
                    cy?: number;
                    payload?: ChartData;
                  }) => {
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
