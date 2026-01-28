// TODO: Update and fix explore mode after changes to trendline and chart views
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import { ChartTooltip } from "@/components/charts";
import { ChartData } from "@/types/emissions";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";
import { generateApproximatedData } from "@/lib/calculations/trends/approximatedData";
import {
  getBaseYearReferenceLineProps,
  getCurrentYearReferenceLineProps,
  getXAxisProps,
  getYAxisProps,
} from "@/components/charts";
import { CumulativeSummaryBoxes } from "./CumulativeSummaryBoxes";

interface ExploreChartProps {
  data: ChartData[];
  step: number;
  companyBaseYear?: number;
  currentLanguage: "sv" | "en";
  trendExplanation?: string;
  yDomain: [number, number];
  parisExplanation?: string;
  trendAnalysis?: {
    method: string;
    explanation: string;
    explanationParams?: Record<string, string | number>;
    coefficients?:
      | { slope: number; intercept: number }
      | { a: number; b: number };
    cleanData?: { year: number; value: number }[];
  } | null;
}

export function ExploreChart({
  data,
  step,
  companyBaseYear,
  currentLanguage,
  trendExplanation,
  yDomain,
  parisExplanation,
  trendAnalysis,
}: ExploreChartProps) {
  const { t } = useTranslation();

  // Use the passed trendAnalysis instead of calculating our own
  const exploreData = useMemo(() => {
    if (!companyBaseYear || !trendAnalysis) return null;

    const emissionsData = data
      .filter((d) => d.total !== undefined && d.total !== null)
      .map((d) => ({ year: d.year, total: d.total as number }));

    if (emissionsData.length < 2) return null;

    const lastReportedYear = Math.max(...emissionsData.map((d) => d.year));

    return {
      trendAnalysis: trendAnalysis,
      cleanData: trendAnalysis?.cleanData || [],
      baseYear: companyBaseYear,
      lastReportedYear,
      coefficients: trendAnalysis?.coefficients,
    };
  }, [data, companyBaseYear, trendAnalysis]);

  const getCommonYears = () => ({
    currentYear: new Date().getFullYear(),
    parisStartYear: 2025,
    endYear2050: 2050,
    endYearShort: new Date().getFullYear() + 5,
  });

  const generateApproximatedDataForStep = (endYear: number) => {
    if (!exploreData?.coefficients) return null;

    const result = generateApproximatedData(
      data,
      endYear,
      exploreData.coefficients,
    );

    return result;
  };

  // Helper function to ensure trend line continuity
  const ensureTrendContinuity = (
    trendData: { year: number; approximated: number | undefined }[],
    lastReportedYear: number,
    lastReportedValue: number | undefined,
  ) => {
    if (!trendData.length || !lastReportedValue) return trendData;

    // Check if we need to add the last reported year to ensure continuity
    const hasLastReportedYear = trendData.some(
      (d) => d.year === lastReportedYear,
    );

    if (!hasLastReportedYear) {
      // Add the last reported year at the beginning to ensure continuity
      trendData.unshift({
        year: lastReportedYear,
        approximated: lastReportedValue,
      });
    }

    return trendData;
  };

  const buildAreaData = (
    years: number[],
    trendSegment: { year: number; approximated: number | undefined }[],
    parisSegment: { year: number; carbonLaw: number | undefined }[],
  ) => {
    return years.map((year) => {
      const trend = trendSegment.find((d) => d.year === year)?.approximated;
      const paris = parisSegment.find((d) => d.year === year)?.carbonLaw;
      const diff =
        trend !== undefined && paris !== undefined ? trend - paris : undefined;

      return {
        year,
        approximated: trend,
        carbonLaw: paris,
        diff,
        trendArea: trend,
        parisArea: paris,
      };
    });
  };

  // render step descriptions
  const renderStepDescription = (step: number) => {
    const descriptions = {
      2: trendExplanation && (
        <div
          className={`text-center text-sm text-gray-400 ${isMobile ? "mb-2" : "mb-4"} max-w-2xl mx-auto`}
        >
          {trendExplanation}
        </div>
      ),
      4: parisExplanation && (
        <div
          className={`text-center text-sm text-green-3 ${isMobile ? "mb-2" : "mb-4"} max-w-2xl mx-auto`}
        >
          {parisExplanation}
        </div>
      ),
    };

    return descriptions[step as keyof typeof descriptions] || null;
  };

  // render common chart elements
  const renderCurrentYearReferenceLine = () => (
    <ReferenceLine
      {...getCurrentYearReferenceLineProps(getCommonYears().currentYear)}
    />
  );

  const renderBaseYearReferenceLine = () =>
    companyBaseYear && (
      <ReferenceLine
        {...getBaseYearReferenceLineProps(companyBaseYear, true, t)}
      />
    );

  const getXAxisDomain = () => {
    const { currentYear, parisStartYear, endYear2050, endYearShort } =
      getCommonYears();

    if (step === 5) return [parisStartYear, endYear2050];
    if (step === 4) return [parisStartYear, endYear2050];
    if (step === 3 && companyBaseYear) return [companyBaseYear, endYearShort];
    if (step === 2 && companyBaseYear) return [companyBaseYear, endYearShort];

    return [data[0]?.year || 2000, data[data.length - 1]?.year || currentYear];
  };

  // common Line component props
  const getCommonLineProps = (
    dataKey: string,
    stroke: string,
    animated: boolean = true,
    showDots: boolean = false,
  ) => ({
    type: "monotone" as const,
    dataKey,
    stroke,
    strokeWidth: 2,
    dot: showDots
      ? { fill: stroke, r: 4, strokeWidth: 0, fillOpacity: 0 }
      : false,
    isAnimationActive: animated,
    animationDuration: 1000,
    connectNulls: true,
  });

  // For step 0, filter data to only before or at base year (for white line only)
  let step0Data = data;
  if (step === 0 && companyBaseYear) {
    step0Data = data.filter((d) => d.year <= companyBaseYear);
  }
  // For step 1, filter data to only base year through last reported year (for green segment only)
  let step1GreenSegment: ChartData[] = [];
  if ((step === 1 || step === 2) && exploreData) {
    step1GreenSegment = data.filter(
      (d) =>
        d.year >= exploreData.baseYear &&
        d.year <= exploreData.lastReportedYear,
    );

    console.log("Step 1/2 Green Segment Debug:", {
      step,
      baseYear: exploreData.baseYear,
      lastReportedYear: exploreData.lastReportedYear,
      step1GreenSegment: step1GreenSegment.map((d) => ({
        year: d.year,
        total: d.total,
      })),
      allDataYears: data.map((d) => d.year).sort((a, b) => a - b),
    });
  }
  // For step 2, calculate the extended trend segment from last reported year to current year + 5
  let step2TrendSegment: { year: number; approximated: number | undefined }[] =
    [];
  if (step === 2 && exploreData?.coefficients) {
    const { endYearShort } = getCommonYears();
    const approximatedData = generateApproximatedDataForStep(endYearShort);
    if (approximatedData) {
      console.log("Step 2 Debug:", {
        lastReportedYear: exploreData.lastReportedYear,
        endYearShort,
        approximatedDataYears: approximatedData.map((d) => ({
          year: d.year,
          approximated: d.approximated,
        })),
        baseYear: exploreData.baseYear,
      });

      // Include the last reported year to ensure continuity, then continue to endYear
      step2TrendSegment = approximatedData
        .filter(
          (d) =>
            d.year >= exploreData.lastReportedYear &&
            d.year <= endYearShort &&
            d.approximated !== undefined &&
            d.approximated !== null,
        )
        .map((d) => ({
          year: d.year,
          approximated: d.approximated === null ? undefined : d.approximated,
        }));

      // Ensure continuity using the helper function
      const lastReportedValue = data.find(
        (d) => d.year === exploreData.lastReportedYear,
      )?.total;
      step2TrendSegment = ensureTrendContinuity(
        step2TrendSegment,
        exploreData.lastReportedYear,
        lastReportedValue,
      );

      console.log("Step 2 Trend Segment:", step2TrendSegment);
      console.log("Step 2 Complete Debug:", {
        step,
        lastReportedYear: exploreData.lastReportedYear,
        lastReportedValue,
        endYearShort,
        step2TrendSegment,
        originalData: data.filter(
          (d) =>
            d.year >= exploreData.lastReportedYear - 1 &&
            d.year <= exploreData.lastReportedYear + 1,
        ),
      });
    }
  }

  // For step 2, build a grey line data array that covers the full X-axis domain
  let step2GreyLine: ChartData[] = [];
  if (step === 2 && exploreData) {
    const { endYearShort } = getCommonYears();
    // Build a data array from base year to endYear
    step2GreyLine = [];
    for (let year = exploreData.baseYear; year <= endYearShort; year++) {
      const found = data.find((d) => d.year === year);
      step2GreyLine.push({
        ...found,
        year,
        total:
          year <= exploreData.baseYear
            ? (found?.total ?? undefined)
            : undefined,
      });
    }
  }
  // For step 3, build the Paris line segment from current year to projection end
  let step3ParisSegment: { year: number; carbonLaw: number | undefined }[] = [];
  let step3FullDomain: number[] = [];
  let step3GreyLine: { year: number; total?: number }[] = [];
  let step3OrangeLine: { year: number; approximated?: number }[] = [];
  if (step === 3 && exploreData?.coefficients) {
    const { endYearShort } = getCommonYears();
    step3FullDomain = Array.from(
      { length: endYearShort - exploreData.baseYear + 1 },
      (_, i) => exploreData.baseYear + i,
    );
    // Grey line: only values up to lastReportedYear
    step3GreyLine = step3FullDomain.map((year) => {
      const found = data.find((d) => d.year === year);
      return {
        year,
        total: year <= exploreData.lastReportedYear ? found?.total : undefined,
      };
    });
    // Orange line: only values after lastReportedYear, from approximatedData
    const approximatedData = generateApproximatedDataForStep(endYearShort);
    if (approximatedData) {
      console.log("Step 3 Debug:", {
        lastReportedYear: exploreData.lastReportedYear,
        endYearShort,
        approximatedDataYears: approximatedData.map((d) => ({
          year: d.year,
          approximated: d.approximated,
        })),
        step3FullDomain,
      });

      step3OrangeLine = step3FullDomain.map((year) => {
        const found = approximatedData.find((d) => d.year === year);
        return {
          year,
          approximated:
            year >= exploreData.lastReportedYear
              ? (found?.approximated ?? undefined)
              : undefined,
        };
      });

      console.log("Step 3 Orange Line Debug:", {
        step,
        lastReportedYear: exploreData.lastReportedYear,
        endYearShort,
        step3OrangeLine: step3OrangeLine.filter(
          (d) => d.approximated !== undefined,
        ),
        approximatedDataYears: approximatedData.map((d) => ({
          year: d.year,
          approximated: d.approximated,
        })),
      });

      // Ensure continuity by adding the last reported year if it's missing
      const lastReportedValue = data.find(
        (d) => d.year === exploreData.lastReportedYear,
      )?.total;
      if (lastReportedValue !== undefined && lastReportedValue !== null) {
        const firstOrangeLineYear = step3OrangeLine.find(
          (d) => d.approximated !== undefined,
        )?.year;
        if (
          firstOrangeLineYear &&
          firstOrangeLineYear > exploreData.lastReportedYear
        ) {
          step3OrangeLine.unshift({
            year: exploreData.lastReportedYear,
            approximated: lastReportedValue,
          });
        }
      }
      // Paris line segment: current year to projection end
      const { currentYear } = getCommonYears();
      step3ParisSegment = approximatedData
        .filter(
          (d) =>
            d.year >= currentYear &&
            d.year <= endYearShort &&
            d.carbonLaw !== undefined &&
            d.carbonLaw !== null,
        )
        .map((d) => ({ year: d.year, carbonLaw: d.carbonLaw ?? undefined }));
    }
  }

  // Step 4: Future comparison segment (current year to 2050, both lines, difference annotation, and area shading)
  let step4ParisSegment: { year: number; carbonLaw: number | undefined }[] = [];
  let step4TrendSegment: { year: number; approximated: number | undefined }[] =
    [];
  let step4Years: number[] = [];
  let step4Difference2050: number | null = null;
  let step4AreaData: {
    year: number;
    approximated?: number;
    carbonLaw?: number;
    diff?: number;
    trendArea?: number;
    parisArea?: number;
  }[] = [];
  if (step === 4 && exploreData?.coefficients) {
    const { parisStartYear, endYear2050 } = getCommonYears();
    step4Years = Array.from(
      { length: endYear2050 - parisStartYear + 1 },
      (_, i) => parisStartYear + i,
    );
    const approximatedData = generateApproximatedDataForStep(endYear2050);
    if (approximatedData) {
      step4ParisSegment = approximatedData
        .filter(
          (d) =>
            d.year >= parisStartYear &&
            d.year <= endYear2050 &&
            d.carbonLaw !== undefined &&
            d.carbonLaw !== null,
        )
        .map((d) => ({ year: d.year, carbonLaw: d.carbonLaw ?? undefined }));
      step4TrendSegment = approximatedData
        .filter(
          (d) =>
            d.year >= parisStartYear &&
            d.year <= endYear2050 &&
            d.approximated !== undefined &&
            d.approximated !== null,
        )
        .map((d) => ({
          year: d.year,
          approximated: d.approximated ?? undefined,
        }));
      // Build area data for shading
      step4AreaData = buildAreaData(
        step4Years,
        step4TrendSegment,
        step4ParisSegment,
      );
    }

    // Calculate the difference at 2050
    const trend2050 = step4TrendSegment.find(
      (d) => d.year === 2050,
    )?.approximated;
    const paris2050 = step4ParisSegment.find((d) => d.year === 2050)?.carbonLaw;
    if (typeof trend2050 === "number" && typeof paris2050 === "number") {
      step4Difference2050 = trend2050 - paris2050;
    }
  }

  // Step 5: Area under curves calculation (current year to 2050)
  let step5AreaData: {
    year: number;
    approximated: number | undefined;
    carbonLaw: number | undefined;
    areaDiff: number | undefined;
  }[] = [];

  if (step === 5 && exploreData?.coefficients) {
    const { parisStartYear, endYear2050 } = getCommonYears();

    // Get trend and Paris data from 2025 to 2050
    const approximatedData = generateApproximatedDataForStep(endYear2050);

    // Build step 5 data array from 2025 to 2050
    step5AreaData = [];

    if (approximatedData) {
      for (let year = parisStartYear; year <= endYear2050; year++) {
        const trendPoint = approximatedData.find((d) => d.year === year);
        const trendValue = trendPoint?.approximated;
        const parisValue = trendPoint?.carbonLaw;

        if (typeof trendValue === "number" && typeof parisValue === "number") {
          const areaDiff = trendValue - parisValue;

          step5AreaData.push({
            year,
            approximated: trendValue,
            carbonLaw: parisValue,
            areaDiff: areaDiff,
          });
        }
      }
    }
  }

  return (
    <>
      {renderStepDescription(step)}
      <div className="relative w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%" className="w-full">
          <ComposedChart
            data={
              step === 5 && step5AreaData.length > 0
                ? step5AreaData
                : step === 4 && step4AreaData.length > 0
                  ? step4AreaData
                  : step === 3 && companyBaseYear
                    ? step3GreyLine
                    : data
            }
            margin={{
              top: isMobile ? 20 : 20,
              right: isMobile ? 0 : 0,
              left: isMobile ? -2 : 0,
              bottom: step === 5 ? (isMobile ? 20 : 120) : isMobile ? 0 : 0,
            }}
          >
            <XAxis
              {...getXAxisProps(
                "year",
                getXAxisDomain() as [number, number],
                undefined,
                undefined,
              )}
              type="number"
            />
            <YAxis
              {...getYAxisProps(currentLanguage)}
              domain={yDomain}
              tickFormatter={(value) =>
                formatEmissionsAbsoluteCompact(value, currentLanguage)
              }
            />
            <Tooltip
              content={
                <ChartTooltip
                  companyBaseYear={companyBaseYear}
                  unit={t("companies.tooltip.tonsCO2e")}
                  trendData={
                    trendAnalysis?.coefficients
                      ? {
                          slope:
                            "slope" in trendAnalysis.coefficients
                              ? trendAnalysis.coefficients.slope
                              : 0,
                          baseYear: companyBaseYear || 0,
                          lastReportedYear: Math.max(
                            ...data.map((d) => d.year),
                          ),
                        }
                      : undefined
                  }
                />
              }
            />

            {/* Step 0: Show data before base year highlighted, line stops at base year */}
            {step === 0 && (
              <>
                {/* Base year reference line */}
                {renderBaseYearReferenceLine()}
                <Line
                  type="monotone"
                  data={step0Data}
                  dataKey="total"
                  stroke="white"
                  strokeWidth={2}
                  dot={
                    isMobile
                      ? false
                      : (props) => {
                          const { cx, cy } = props;
                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={4}
                              fill="white"
                              stroke="white"
                            />
                          );
                        }
                  }
                  isAnimationActive
                  animationDuration={1000}
                  connectNulls
                />
              </>
            )}
            {/* Step 1: Show full line in grey, overlay green segment with dots for base year to last reported year */}
            {step === 1 && (
              <>
                {/* Base year reference line */}
                {renderBaseYearReferenceLine()}
                {/* Full line in grey, no dots - but only up to last reported year */}
                <Line
                  {...getCommonLineProps("total", "var(--grey)", false)}
                  data={data.filter(
                    (d) =>
                      d.year <=
                      (exploreData?.lastReportedYear ||
                        new Date().getFullYear()),
                  )}
                />
                {/* Debug: Log what data is being shown */}
                {console.log("Step 1 Debug:", {
                  step,
                  lastReportedYear: exploreData?.lastReportedYear,
                  filteredData: data.filter(
                    (d) =>
                      d.year <=
                      (exploreData?.lastReportedYear ||
                        new Date().getFullYear()),
                  ),
                  step1GreenSegment,
                })}
                {/* Green segment with dots for base year to last reported year */}
                {companyBaseYear && step1GreenSegment.length > 0 && (
                  <Line
                    key={`step1-green-${step}`}
                    type="monotone"
                    data={step1GreenSegment}
                    dataKey="total"
                    stroke="var(--orange-3)"
                    strokeWidth={2}
                    dot={
                      isMobile
                        ? false
                        : (props) => {
                            const { cx, cy } = props;
                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={4}
                                fill="var(--orange-3)"
                                stroke="var(--orange-3)"
                              />
                            );
                          }
                    }
                    isAnimationActive
                    animationDuration={1000}
                    connectNulls
                  />
                )}
              </>
            )}
            {/* Step 2: Show full line in grey, overlay green segment, overlay orange trend segment from last reported year to current year + 5 */}
            {step === 2 && (
              <>
                {/* Base year reference line */}
                {renderBaseYearReferenceLine()}
                {/* Grey context line: base year to last reported year, no dots */}
                {companyBaseYear && step1GreenSegment.length > 0 && (
                  <Line
                    {...getCommonLineProps("total", "var(--grey)", false)}
                    data={step1GreenSegment}
                  />
                )}
                {companyBaseYear && step2TrendSegment.length > 0 && (
                  <Line
                    key={`step2-orange-${step}`}
                    type="monotone"
                    data={step2TrendSegment}
                    dataKey="approximated"
                    stroke="var(--orange-3)"
                    strokeWidth={2}
                    dot={{ fill: "var(--orange-3)", r: 0, strokeWidth: 0 }}
                    isAnimationActive
                    animationDuration={1000}
                    connectNulls
                  />
                )}
              </>
            )}
            {/* Step 3: Show grey line for reported values, orange for trend/approximated, and highlight the Paris line (green) from current year to projection end */}
            {step === 3 && (
              <>
                {/* Base year reference line */}
                {renderBaseYearReferenceLine()}
                {/* Vertical line for current year */}
                {renderCurrentYearReferenceLine()}
                {/* Grey context line: base year to last reported year, no dots, always shown for full X domain */}
                {companyBaseYear && step3GreyLine.length > 0 && (
                  <Line
                    {...getCommonLineProps("total", "var(--grey)", false)}
                    data={step3GreyLine}
                  />
                )}
                {/* Orange trend segment: last reported year to current year + 5 */}
                {companyBaseYear && step3OrangeLine.length > 0 && (
                  <Line
                    {...getCommonLineProps(
                      "approximated",
                      "var(--orange-3)",
                      false,
                      true,
                    )}
                    data={step3OrangeLine}
                  />
                )}
                {/* Paris line: current year to projection end, green, no dots */}
                {step3ParisSegment.length > 0 && (
                  <Line
                    {...getCommonLineProps(
                      "carbonLaw",
                      "var(--green-3)",
                      true,
                      true,
                    )}
                    data={step3ParisSegment}
                  />
                )}
              </>
            )}
            {/* Step 4: Show trend and Paris lines from current year to 2050, annotate the difference at 2050 */}
            {step === 4 && (
              <>
                {/* Vertical line for current year */}
                {renderCurrentYearReferenceLine()}

                {/* Paris line: green, no dots */}
                {step4ParisSegment.length > 0 && (
                  <Line
                    {...getCommonLineProps(
                      "carbonLaw",
                      "var(--green-4)",
                      true,
                      true,
                    )}
                    data={step4ParisSegment}
                  />
                )}

                {/* Trend line: orange, no dots */}
                {step4TrendSegment.length > 0 && (
                  <Line
                    {...getCommonLineProps(
                      "approximated",
                      "var(--orange-4)",
                      true,
                      true,
                    )}
                    data={step4TrendSegment}
                  />
                )}

                {/* Difference annotation at 2050 */}
                {step4Difference2050 !== null && (
                  <ReferenceLine
                    x={getCommonYears().endYear2050}
                    stroke="var(--grey)"
                    strokeDasharray="3 3"
                    label={{
                      value: "",
                      position: "left",
                      fill: "var(--grey)",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  />
                )}
              </>
            )}
            {/* Step 5: Show area under curves with total cumulative difference */}
            {step === 5 && (
              <>
                {/* Vertical line for current year */}
                {renderCurrentYearReferenceLine()}

                {/* Shaded area under Paris line */}
                {step5AreaData.length > 0 && (
                  <Area
                    type="monotone"
                    dataKey="carbonLaw"
                    stroke="var(--green-3)"
                    fill="var(--green-3)"
                    stackId="1"
                    fillOpacity={0.8}
                  />
                )}

                {/* Shaded area under trend line */}
                {step5AreaData.length > 0 && (
                  <Area
                    type="monotone"
                    dataKey="approximated"
                    stroke="var(--orange-3)"
                    fill="var(--orange-3)"
                    stackId="2"
                    fillOpacity={0.4}
                  />
                )}

                {/* Paris line: green, no dots */}
                <Line
                  {...getCommonLineProps(
                    "carbonLaw",
                    "var(--green-4)",
                    true,
                    true,
                  )}
                />
                {/* Trend line: orange, no dots */}
                <Line
                  {...getCommonLineProps(
                    "approximated",
                    "var(--orange-4)",
                    true,
                    true,
                  )}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Information boxes for step 5 */}
        {step === 5 && step5AreaData.length > 0 && !isMobile && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-black-2/80 backdrop-blur-sm">
            <div className="flex flex-col gap-3 p-4">
              <CumulativeSummaryBoxes
                step5Data={step5AreaData}
                currentLanguage={currentLanguage}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
