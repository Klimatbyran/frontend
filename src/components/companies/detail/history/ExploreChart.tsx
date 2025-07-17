import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
} from "recharts";
import { CustomTooltip } from "../CustomTooltip";
import { ChartData } from "@/types/emissions";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";
import { calculateLinearRegression } from "@/lib/calculations/trends/regression";

// Patch: redefine generateApproximatedData to return carbonLaw as number | undefined
import * as companyEmissionsCalculations from "@/utils/calculations/emissions";
const generateApproximatedData = (
  ...args: Parameters<
    typeof companyEmissionsCalculations.generateApproximatedData
  >
) => {
  const result = companyEmissionsCalculations.generateApproximatedData(...args);
  return result.map((d) => ({
    ...d,
    carbonLaw: d.carbonLaw === null ? undefined : d.carbonLaw,
    approximated: d.approximated ?? null,
  }));
};

interface ExploreChartProps {
  data: ChartData[];
  step: number;
  companyBaseYear?: number;
  currentLanguage: "sv" | "en";
  trendExplanation?: string;
  yDomain: [number, number];
  parisExplanation?: string;
}

export function ExploreChart({
  data,
  step,
  companyBaseYear,
  currentLanguage,
  trendExplanation,
  yDomain,
  parisExplanation,
}: ExploreChartProps) {
  // For step 0, filter data to only before or at base year (for white line only)
  let step0Data = data;
  if (step === 0 && companyBaseYear) {
    step0Data = data.filter((d) => d.year <= companyBaseYear);
  }
  // For step 1, filter data to only base year through last reported year (for green segment only)
  let step1GreenSegment: ChartData[] = [];
  if ((step === 1 || step === 2) && companyBaseYear) {
    const lastReportedYear = data
      .filter((d) => d.total !== undefined && d.total !== null)
      .reduce((last, d) => Math.max(last, d.year), companyBaseYear);
    step1GreenSegment = data.filter(
      (d) => d.year >= companyBaseYear && d.year <= lastReportedYear,
    );
  }
  // For step 2, calculate the approximated (trend) segment from last reported year to current year
  let step2TrendSegment: { year: number; approximated: number | null }[] = [];
  if (step === 2 && companyBaseYear) {
    // Regression points: same logic as main chart
    const regressionPoints = data
      .filter(
        (d) =>
          d.total !== undefined &&
          d.total !== null &&
          d.year >= companyBaseYear,
      )
      .map((d) => ({ year: d.year, value: d.total as number }));
    if (regressionPoints.length >= 2) {
      const regression = calculateLinearRegression(regressionPoints);
      if (regression) {
        const lastReportedYear = data
          .filter((d) => d.total !== undefined && d.total !== null)
          .reduce((last, d) => Math.max(last, d.year), companyBaseYear);
        const currentYear = new Date().getFullYear();
        const approximatedData = generateApproximatedData(
          data,
          regression,
          currentYear,
        );
        // Only keep the segment from lastReportedYear to currentYear
        step2TrendSegment = approximatedData.filter(
          (d) =>
            d.year >= lastReportedYear &&
            d.year <= currentYear &&
            d.approximated !== null,
        );
      }
    }
  }
  // For step 2, filter data to only base year onward
  let step2Data: ChartData[] = [];
  if (step === 2 && companyBaseYear) {
    step2Data = data.filter((d) => d.year >= companyBaseYear);
  }
  // For step 3, calculate the extended trend segment from last reported year to current year + 5
  let step3TrendSegment: { year: number; approximated: number | undefined }[] =
    [];
  if (step === 3 && companyBaseYear) {
    const regressionPoints = data
      .filter(
        (d) =>
          d.total !== undefined &&
          d.total !== null &&
          d.year >= companyBaseYear,
      )
      .map((d) => ({ year: d.year, value: d.total as number }));
    if (regressionPoints.length >= 2) {
      const regression = calculateLinearRegression(regressionPoints);
      if (regression) {
        const lastReportedYear = data
          .filter((d) => d.total !== undefined && d.total !== null)
          .reduce((last, d) => Math.max(last, d.year), companyBaseYear);
        const endYear = new Date().getFullYear() + 5;
        const approximatedData = generateApproximatedData(
          data,
          regression,
          endYear,
        );
        // Only keep the segment from lastReportedYear to endYear
        step3TrendSegment = approximatedData
          .filter(
            (d) =>
              d.year >= lastReportedYear &&
              d.year <= endYear &&
              d.approximated !== undefined &&
              d.approximated !== null,
          )
          .map((d) => ({
            ...d,
            approximated: d.approximated === null ? undefined : d.approximated,
          }));
      }
    }
  }
  // For step 3, build a grey line data array that covers the full X-axis domain
  let step3GreyLine: ChartData[] = [];
  if (step === 3 && companyBaseYear) {
    const lastReportedYear = data
      .filter((d) => d.total !== undefined && d.total !== null)
      .reduce((last, d) => Math.max(last, d.year), companyBaseYear);
    const endYear = new Date().getFullYear() + 5;
    // Build a data array from base year to endYear
    step3GreyLine = [];
    for (let year = companyBaseYear; year <= endYear; year++) {
      const found = data.find((d) => d.year === year);
      step3GreyLine.push({
        ...found,
        year,
        total:
          year <= lastReportedYear ? (found?.total ?? undefined) : undefined,
      });
    }
  }
  // For step 4, build the Paris line segment from current year to projection end
  let step4ParisSegment: { year: number; carbonLaw: number | undefined }[] = [];
  let step4FullDomain: number[] = [];
  let step4GreyLine: { year: number; total?: number }[] = [];
  let step4OrangeLine: { year: number; approximated?: number }[] = [];
  if (step === 4 && companyBaseYear) {
    const lastReportedYear = data
      .filter((d) => d.total !== undefined && d.total !== null)
      .reduce((last, d) => Math.max(last, d.year), companyBaseYear);
    const endYear = new Date().getFullYear() + 5;
    step4FullDomain = Array.from(
      { length: endYear - companyBaseYear + 1 },
      (_, i) => companyBaseYear + i,
    );
    // Grey line: only values up to lastReportedYear
    step4GreyLine = step4FullDomain.map((year) => {
      const found = data.find((d) => d.year === year);
      return {
        year,
        total: year <= lastReportedYear ? found?.total : undefined,
      };
    });
    // Orange line: only values after lastReportedYear, from approximatedData
    const regressionPoints = data
      .filter(
        (d) =>
          d.total !== undefined &&
          d.total !== null &&
          d.year >= companyBaseYear,
      )
      .map((d) => ({ year: d.year, value: d.total as number }));
    if (regressionPoints.length >= 2) {
      const regression = calculateLinearRegression(regressionPoints);
      if (regression) {
        const approximatedData = generateApproximatedData(
          data,
          regression,
          endYear,
        );
        step4OrangeLine = step4FullDomain.map((year) => {
          const found = approximatedData.find((d) => d.year === year);
          return {
            year,
            approximated:
              year >= lastReportedYear
                ? (found?.approximated ?? undefined)
                : undefined,
          };
        });
        // Paris line segment: current year to projection end
        const currentYear = new Date().getFullYear();
        step4ParisSegment = approximatedData
          .filter(
            (d) =>
              d.year >= currentYear &&
              d.year <= endYear &&
              d.carbonLaw !== undefined &&
              d.carbonLaw !== null,
          )
          .map((d) => ({ year: d.year, carbonLaw: d.carbonLaw ?? undefined }));
      }
    }
  }

  // Step 5: Future comparison segment (current year to 2050, both lines, difference annotation, and area shading)
  let step5ParisSegment: { year: number; carbonLaw: number | undefined }[] = [];
  let step5TrendSegment: { year: number; approximated: number | undefined }[] =
    [];
  let step5Years: number[] = [];
  let step5Difference2050: number | null = null;
  let step5AreaData: {
    year: number;
    approximated?: number;
    carbonLaw?: number;
    diff?: number;
    diffTop?: number;
    diffBottom?: number;
  }[] = [];
  let step5AreaColor: string = "#F59E42AA"; // default orange
  let step5LabelText: string = "";
  let step5LabelColor: string = "#F59E42";
  if (step === 5 && companyBaseYear) {
    const currentYear = new Date().getFullYear();
    const endYear = 2050;
    step5Years = Array.from(
      { length: endYear - currentYear + 1 },
      (_, i) => currentYear + i,
    );
    const regressionPoints = data
      .filter(
        (d) =>
          d.total !== undefined &&
          d.total !== null &&
          d.year >= companyBaseYear,
      )
      .map((d) => ({ year: d.year, value: d.total as number }));
    if (regressionPoints.length >= 2) {
      const regression = calculateLinearRegression(regressionPoints);
      if (regression) {
        const approximatedData = generateApproximatedData(
          data,
          regression,
          endYear,
        );
        step5ParisSegment = approximatedData
          .filter(
            (d) =>
              d.year >= currentYear &&
              d.year <= endYear &&
              d.carbonLaw !== undefined &&
              d.carbonLaw !== null,
          )
          .map((d) => ({ year: d.year, carbonLaw: d.carbonLaw ?? undefined }));
        step5TrendSegment = approximatedData
          .filter(
            (d) =>
              d.year >= currentYear &&
              d.year <= endYear &&
              d.approximated !== undefined &&
              d.approximated !== null,
          )
          .map((d) => ({
            year: d.year,
            approximated: d.approximated ?? undefined,
          }));
        // Build area data for shading
        step5AreaData = step5Years.map((year) => {
          const trend = step5TrendSegment.find(
            (d) => d.year === year,
          )?.approximated;
          const paris = step5ParisSegment.find(
            (d) => d.year === year,
          )?.carbonLaw;
          const diff =
            trend !== undefined && paris !== undefined
              ? trend - paris
              : undefined;
          return {
            year,
            approximated: trend,
            carbonLaw: paris,
            diff,
            diffTop:
              trend !== undefined && paris !== undefined
                ? Math.max(trend, paris)
                : undefined,
            diffBottom:
              trend !== undefined && paris !== undefined
                ? Math.min(trend, paris)
                : undefined,
          };
        });
        // Calculate the difference at 2050
        const trend2050 = step5TrendSegment.find(
          (d) => d.year === 2050,
        )?.approximated;
        const paris2050 = step5ParisSegment.find(
          (d) => d.year === 2050,
        )?.carbonLaw;
        if (typeof trend2050 === "number" && typeof paris2050 === "number") {
          step5Difference2050 = trend2050 - paris2050;
          if (step5Difference2050 < 0) {
            step5AreaColor = "#4ADE80AA"; // green
            step5LabelColor = "#4ADE80";
            step5LabelText = `${formatEmissionsAbsoluteCompact(Math.abs(step5Difference2050), currentLanguage)} t under Paris target`;
          } else {
            step5AreaColor = "#F59E42AA"; // orange
            step5LabelColor = "#F59E42";
            step5LabelText = `${formatEmissionsAbsoluteCompact(Math.abs(step5Difference2050), currentLanguage)} t over Paris target`;
          }
        }
      }
    }
  }

  // Step 6: Area under curves calculation (current year to 2050)
  let step6AreaData: {
    year: number;
    trend: number | undefined;
    paris: number | undefined;
    areaDiff: number | undefined;
  }[] = [];
  let step6TotalAreaDifference: number | null = null;
  let step6AreaLabelText: string = "";
  let step6AreaLabelColor: string = "#888888";

  if (step === 6 && companyBaseYear) {
    const currentYear = new Date().getFullYear();
    const endYear = 2050;

    // Get trend and Paris data from current year to 2050
    const regressionPoints = data
      .filter(
        (d) =>
          d.total !== undefined &&
          d.total !== null &&
          d.year >= companyBaseYear,
      )
      .map((d) => ({ year: d.year, value: d.total as number }));

    if (regressionPoints.length >= 2) {
      const regression = calculateLinearRegression(regressionPoints);
      if (regression) {
        const approximatedData = generateApproximatedData(
          data,
          regression,
          endYear,
        );

        // Build step 6 data array from current year to 2050
        step6AreaData = [];
        let totalAreaDifference = 0;

        for (let year = currentYear; year <= endYear; year++) {
          const trendPoint = approximatedData.find((d) => d.year === year);
          const trendValue = trendPoint?.approximated;
          const parisValue = trendPoint?.carbonLaw;

          if (
            typeof trendValue === "number" &&
            typeof parisValue === "number"
          ) {
            const areaDiff = trendValue - parisValue;
            totalAreaDifference += areaDiff;

            step6AreaData.push({
              year,
              trend: trendValue,
              paris: parisValue,
              areaDiff: areaDiff,
            });
          }
        }

        step6TotalAreaDifference = totalAreaDifference;

        if (step6TotalAreaDifference < 0) {
          step6AreaLabelColor = "#4ADE80"; // green
          step6AreaLabelText = `${formatEmissionsAbsoluteCompact(Math.abs(step6TotalAreaDifference), currentLanguage)} t total emissions saved vs Paris target`;
        } else {
          step6AreaLabelColor = "#F59E42"; // orange
          step6AreaLabelText = `${formatEmissionsAbsoluteCompact(Math.abs(step6TotalAreaDifference), currentLanguage)} t total emissions excess vs Paris target`;
        }
      }
    }
  }
  return (
    <>
      {step === 2 && trendExplanation && (
        <div className="text-center text-sm text-gray-400 mb-4 max-w-2xl mx-auto">
          {trendExplanation}
        </div>
      )}
      {step === 4 && parisExplanation && (
        <div className="text-center text-sm text-green-400 mb-4 max-w-2xl mx-auto">
          {parisExplanation}
        </div>
      )}
      {step === 5 && (
        <div className="text-center text-sm text-gray-400 mb-4 max-w-2xl mx-auto">
          The difference at 2050 is calculated as:{" "}
          <strong>Trend line value - Paris target value</strong>. A negative
          value (green area) means the company is projected to be under the
          Paris target. A positive value (orange area) means the company is
          projected to exceed the Paris target.
        </div>
      )}
      {step === 6 && (
        <div className="text-center text-sm text-gray-400 mb-4 max-w-2xl mx-auto">
          The total area difference shows cumulative emissions over time. The
          area between the trend line and Paris target line represents the total
          emissions difference from current year to 2050. Green areas (below
          Paris line) reduce the total, orange areas (above Paris line) increase
          it.
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%" className="w-full">
        <LineChart
          data={
            step === 6 && step6AreaData.length > 0
              ? step6AreaData
              : step === 5 && step5AreaData.length > 0
                ? step5AreaData
                : step === 4 && companyBaseYear
                  ? step4GreyLine
                  : step === 2 && companyBaseYear
                    ? step2Data
                    : data
          }
          margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="year"
            stroke="var(--grey)"
            tickLine={false}
            axisLine={false}
            type="number"
            domain={
              step === 6
                ? [new Date().getFullYear(), 2050]
                : step === 5
                  ? [new Date().getFullYear(), 2050]
                  : step === 4 && companyBaseYear
                    ? [companyBaseYear, new Date().getFullYear() + 5]
                    : step === 2 && companyBaseYear
                      ? [
                          companyBaseYear,
                          data[data.length - 1]?.year ||
                            new Date().getFullYear(),
                        ]
                      : step === 3 && companyBaseYear
                        ? [companyBaseYear, new Date().getFullYear() + 5]
                        : [
                            data[0]?.year || 2000,
                            data[data.length - 1]?.year ||
                              new Date().getFullYear(),
                          ]
            }
            tick={{ fontSize: 12, fill: "var(--grey)" }}
          />
          <YAxis
            stroke="var(--grey)"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={60}
            domain={yDomain}
            tickFormatter={(value) =>
              formatEmissionsAbsoluteCompact(value, currentLanguage)
            }
          />
          <Tooltip
            content={<CustomTooltip companyBaseYear={companyBaseYear} />}
          />
          {/* Base year reference line */}
          {companyBaseYear && (
            <ReferenceLine
              x={companyBaseYear}
              stroke="var(--orange-2)"
              strokeWidth={2}
              label={{
                value: "Base Year",
                position: "top",
                fill: "var(--orange-2)",
                fontSize: 12,
              }}
            />
          )}
          {/* Step 0: Show data before base year highlighted, line stops at base year */}
          {step === 0 && (
            <Line
              type="monotone"
              data={step0Data}
              dataKey="total"
              stroke="white"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy } = props;
                return (
                  <circle cx={cx} cy={cy} r={4} fill="white" stroke="white" />
                );
              }}
              isAnimationActive={true}
              animationDuration={1000}
              connectNulls
            />
          )}
          {/* Step 1: Show full line in grey, overlay green segment with dots for base year to last reported year */}
          {step === 1 && (
            <>
              {/* Full line in grey, no dots */}
              <Line
                type="monotone"
                dataKey="total"
                stroke="#888888"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              {/* Green segment with dots for base year to last reported year */}
              {companyBaseYear && step1GreenSegment.length > 0 && (
                <Line
                  type="monotone"
                  data={step1GreenSegment}
                  dataKey="total"
                  stroke="#4ADE80"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="#4ADE80"
                        stroke="#4ADE80"
                      />
                    );
                  }}
                  isAnimationActive={true}
                  animationDuration={1000}
                  connectNulls
                />
              )}
            </>
          )}
          {/* Step 2: Show full line in grey, overlay green segment, overlay orange trend segment from last reported year to current year */}
          {step === 2 && (
            <>
              {/* Grey context line: base year to last reported year, no dots */}
              {companyBaseYear && step1GreenSegment.length > 0 && (
                <Line
                  type="monotone"
                  data={step1GreenSegment}
                  dataKey="total"
                  stroke="#888888"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              )}
              {/* Orange trend segment: last reported year to current year */}
              {step2TrendSegment.length > 0 && (
                <Line
                  type="monotone"
                  data={step2TrendSegment}
                  dataKey="approximated"
                  stroke="#F59E42"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    if (payload.approximated == null) return <g />;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="#F59E42"
                        stroke="#F59E42"
                      />
                    );
                  }}
                  isAnimationActive={true}
                  animationDuration={1000}
                  connectNulls
                />
              )}
            </>
          )}
          {/* Step 3: Show full line in grey, overlay green segment, overlay orange trend segment from last reported year to current year + 5 */}
          {step === 3 && (
            <>
              {/* Grey context line: base year to last reported year, no dots, always shown for full X domain */}
              {companyBaseYear && step3GreyLine.length > 0 && (
                <Line
                  type="monotone"
                  data={step3GreyLine}
                  dataKey="total"
                  stroke="#888888"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              )}
              {/* Orange trend segment: last reported year to current year + 5, muted, no dots */}
              {step3TrendSegment.length > 0 && (
                <Line
                  type="monotone"
                  data={step3TrendSegment}
                  dataKey="approximated"
                  stroke="#F59E42AA"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1000}
                  connectNulls
                />
              )}
            </>
          )}
          {/* Step 4: Show grey line for reported values, orange for trend/approximated, and highlight the Paris line (green) from current year to projection end */}
          {step === 4 && (
            <>
              {/* Vertical line for current year */}
              <ReferenceLine
                x={new Date().getFullYear()}
                stroke="#4ADE80"
                strokeWidth={2}
                label={{
                  value: "Current Year",
                  position: "top",
                  fill: "#4ADE80",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              />
              {/* Grey context line: base year to last reported year, no dots, always shown for full X domain */}
              {companyBaseYear && step4GreyLine.length > 0 && (
                <Line
                  type="monotone"
                  data={step4GreyLine}
                  dataKey="total"
                  stroke="#888888"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              )}
              {/* Orange trend segment: last reported year to current year + 5 */}
              {companyBaseYear && step4OrangeLine.length > 0 && (
                <Line
                  type="monotone"
                  data={step4OrangeLine}
                  dataKey="approximated"
                  stroke="#F59E42AA"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1000}
                  connectNulls
                />
              )}
              {/* Paris line: current year to projection end, green, no dots */}
              {step4ParisSegment.length > 0 && (
                <Line
                  type="monotone"
                  data={step4ParisSegment}
                  dataKey="carbonLaw"
                  stroke="var(--green-3)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1000}
                  connectNulls
                />
              )}
            </>
          )}
          {/* Step 5: Show trend and Paris lines from current year to 2050, annotate the difference at 2050, and shade the area between them */}
          {step === 5 && (
            <>
              {/* Vertical line for current year */}
              <ReferenceLine
                x={new Date().getFullYear()}
                stroke="#888888"
                strokeWidth={2}
                label={{
                  value: "Current Year",
                  position: "top",
                  fill: "#888888",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              />
              {/* Shaded area between trend and Paris lines using diffTop/diffBottom */}
              {step5AreaData.length > 0 && (
                <>
                  <Area
                    type="monotone"
                    dataKey="diffBottom"
                    stroke="none"
                    fill="none"
                    stackId="diff"
                    isAnimationActive={true}
                    animationDuration={1000}
                    connectNulls
                    yAxisId={0}
                  />
                  <Area
                    type="monotone"
                    dataKey="diffTop"
                    stroke="none"
                    fill={
                      step5Difference2050 !== null && step5Difference2050 < 0
                        ? "#00FF00"
                        : "#FF6600"
                    }
                    fillOpacity={0.8}
                    stackId="diff"
                    isAnimationActive={true}
                    animationDuration={1000}
                    connectNulls
                    yAxisId={0}
                  />
                </>
              )}
              {/* Paris line: green, no dots */}
              {step5ParisSegment.length > 0 && (
                <Line
                  type="monotone"
                  data={step5ParisSegment}
                  dataKey="carbonLaw"
                  stroke="var(--green-3)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1000}
                  connectNulls
                />
              )}
              {/* Trend line: muted orange, no dots */}
              {step5TrendSegment.length > 0 && (
                <Line
                  type="monotone"
                  data={step5TrendSegment}
                  dataKey="approximated"
                  stroke="#F59E42AA"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1000}
                  connectNulls
                />
              )}
              {/* Difference annotation at 2050 */}
              {step5Difference2050 !== null && (
                <ReferenceLine
                  x={2050}
                  stroke="#888888"
                  strokeDasharray="3 3"
                  label={{
                    value: step5LabelText,
                    position: "left",
                    fill: step5LabelColor,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
              )}
            </>
          )}
          {/* Step 6: Show area under curves with total cumulative difference */}
          {step === 6 && (
            <>
              {/* Vertical line for current year */}
              <ReferenceLine
                x={new Date().getFullYear()}
                stroke="#888888"
                strokeWidth={2}
                label={{
                  value: "Current Year",
                  position: "top",
                  fill: "#888888",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              />
              {/* Shaded area between trend and Paris lines */}
              {step6AreaData.length > 0 && (
                <>
                  <Area
                    type="monotone"
                    dataKey="paris"
                    stroke="none"
                    fill="none"
                    stackId="area"
                    isAnimationActive={true}
                    animationDuration={1000}
                    connectNulls
                    yAxisId={0}
                  />
                  <Area
                    type="monotone"
                    dataKey="trend"
                    stroke="none"
                    fill={
                      step6TotalAreaDifference !== null &&
                      step6TotalAreaDifference < 0
                        ? "#4ADE80"
                        : "#F59E42"
                    }
                    fillOpacity={0.3}
                    stackId="area"
                    isAnimationActive={true}
                    animationDuration={1000}
                    connectNulls
                    yAxisId={0}
                  />
                </>
              )}
              {/* Paris line: green, no dots */}
              <Line
                type="monotone"
                dataKey="paris"
                stroke="var(--green-3)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={1000}
                connectNulls
              />
              {/* Trend line: orange, no dots */}
              <Line
                type="monotone"
                dataKey="trend"
                stroke="#F59E42"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={1000}
                connectNulls
              />
              {/* Total area difference annotation */}
              {step6TotalAreaDifference !== null && (
                <ReferenceLine
                  x={2050}
                  stroke="#888888"
                  strokeDasharray="3 3"
                  label={{
                    value: step6AreaLabelText,
                    position: "left",
                    fill: step6AreaLabelColor,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
              )}
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
