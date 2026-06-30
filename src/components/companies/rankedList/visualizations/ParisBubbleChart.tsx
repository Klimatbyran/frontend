import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type {
  CompanyKPIValue,
  CompanyWithKPIs,
} from "@/hooks/companies/useCompanyKPIs";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { get2025Emissions } from "@/lib/calculations/trends/meetsParis";
import {
  calculateParisPathBudget,
  calculateTrendTotalEmissions,
} from "@/utils/calculations/carbonBudget";
import { getBestUnit, formatWithBestUnit } from "@/utils/data/unitScaling";
import { COLORS } from "@/lib/colors";
import { useScreenSize } from "@/hooks/useScreenSize";
import { getCompanyUrlSegment } from "@/utils/companyRouting";
import {
  getCompanyOverviewKPIColor,
  getCompanyOverviewKPINumericRange,
} from "@/utils/insights/companyOverviewKpiColor";
import { BeeswarmLegend } from "./shared/BeeswarmLegend";

/** Company cumulative budgets are never shown in Gt — Mt at most. */
const MAX_COMPANY_BUDGET_UNIT_DIVISOR = 1_000_000;

interface ParisBubbleChartProps {
  companies: CompanyWithKPIs[];
  selectedKPI: CompanyKPIValue;
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

interface BubblePoint {
  company: CompanyWithKPIs;
  x: number;
  y: number;
  z: number;
  color: string;
  parisBudgetRaw: number;
  trendTotalRaw: number;
  emissions2025Raw: number;
}

/** Linear diameter vs emissions (Recharts maps z → area, so z ∝ emissions²). */
function getBubbleSizeValue(
  emissions: number,
  maxEmissions: number,
): number {
  if (maxEmissions <= 0) return 0;
  const ratio = emissions / maxEmissions;
  return ratio * ratio;
}

function getAxisMax(maxValue: number, divisor: number): number {
  if (maxValue <= 0) return 1;
  return Math.ceil((maxValue / divisor) * 1.05 * 10) / 10;
}

interface BubbleTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: BubblePoint }>;
  selectedKPI: CompanyKPIValue;
}

function formatKPIValue(
  company: CompanyWithKPIs,
  selectedKPI: CompanyKPIValue,
): string {
  const value = company[selectedKPI.key as keyof CompanyWithKPIs];

  if (value === null || value === undefined) {
    return selectedKPI.nullValues ?? "—";
  }

  if (typeof value === "boolean") {
    return value
      ? (selectedKPI.booleanLabels?.true ?? "Yes")
      : (selectedKPI.booleanLabels?.false ?? "No");
  }

  if (typeof value === "number") {
    return `${value.toFixed(1)}${selectedKPI.unit ?? ""}`;
  }

  return String(value);
}

function BubbleTooltip({ active, payload, selectedKPI }: BubbleTooltipProps) {
  const { t } = useTranslation();

  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  const formatTonnes = (value: number) =>
    formatWithBestUnit(
      value,
      Math.max(Math.abs(value), 1),
      "tonnes",
      1,
      MAX_COMPANY_BUDGET_UNIT_DIVISOR,
    );
  const kpiValue = formatKPIValue(point.company, selectedKPI);

  return (
    <div className="rounded-2xl bg-black/80 backdrop-blur-sm border border-black-3 p-4 text-sm shadow-lg">
      <p className="font-medium text-white text-base mb-2">
        {point.company.name}
      </p>
      <div className="space-y-1 text-white/70">
        <p>
          <span className="text-grey">{selectedKPI.label}:</span>{" "}
          <span style={{ color: point.color }}>{kpiValue}</span>
        </p>
        <p>
          <span className="text-grey">
            {t(
              "companiesOverviewPage.visualizations.meetsParis.bubbleChart.parisBudget",
            )}
            :
          </span>{" "}
          {formatTonnes(point.parisBudgetRaw)}
        </p>
        <p>
          <span className="text-grey">
            {t(
              "companiesOverviewPage.visualizations.meetsParis.bubbleChart.trendTotal",
            )}
            :
          </span>{" "}
          {formatTonnes(point.trendTotalRaw)}
        </p>
        <p>
          <span className="text-grey">
            {t(
              "companiesOverviewPage.visualizations.meetsParis.bubbleChart.emissions2025",
            )}
            :
          </span>{" "}
          {formatTonnes(point.emissions2025Raw)}
        </p>
      </div>
    </div>
  );
}

export function ParisBubbleChart({
  companies,
  selectedKPI,
  onCompanyClick,
}: ParisBubbleChartProps) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setActiveIndex(null);
  }, [selectedKPI.key]);

  const { points, unitScale, xAxisMax, yAxisMax, numericRange } =
    useMemo(() => {
      const numericRange = getCompanyOverviewKPINumericRange(
        companies,
        selectedKPI,
      );
      const rawPoints: Array<{
        company: CompanyWithKPIs;
        parisBudgetRaw: number;
        trendTotalRaw: number;
        emissions2025Raw: number;
      }> = [];

      companies.forEach((company) => {
        const trendAnalysis = calculateTrendline(company);
        const parisBudgetRaw = calculateParisPathBudget(company, trendAnalysis);
        const trendTotalRaw = calculateTrendTotalEmissions(
          company,
          trendAnalysis,
        );
        const emissions2025Raw = get2025Emissions(company, trendAnalysis);

        if (
          parisBudgetRaw === null ||
          trendTotalRaw === null ||
          emissions2025Raw === null ||
          emissions2025Raw <= 0
        ) {
          return;
        }

        rawPoints.push({
          company,
          parisBudgetRaw,
          trendTotalRaw,
          emissions2025Raw,
        });
      });

      const maxParisBudget = Math.max(
        0,
        ...rawPoints.map((point) => point.parisBudgetRaw),
      );
      const maxTrendTotal = Math.max(
        0,
        ...rawPoints.map((point) => point.trendTotalRaw),
      );
      const maxRawValue = Math.max(maxParisBudget, maxTrendTotal);
      const unitScale = getBestUnit(
        maxRawValue,
        "tonnes",
        MAX_COMPANY_BUDGET_UNIT_DIVISOR,
      );

      const maxEmissions = Math.max(
        0,
        ...rawPoints.map((point) => point.emissions2025Raw),
      );

      const points: BubblePoint[] = rawPoints.map((point) => ({
        ...point,
        x: point.parisBudgetRaw / unitScale.divisor,
        y: point.trendTotalRaw / unitScale.divisor,
        z: getBubbleSizeValue(point.emissions2025Raw, maxEmissions),
        color: getCompanyOverviewKPIColor(
          point.company,
          selectedKPI,
          numericRange,
        ),
      }));

      const xAxisMax = getAxisMax(maxParisBudget, unitScale.divisor);
      const yAxisMax = getAxisMax(maxTrendTotal, unitScale.divisor);

      return {
        points,
        unitScale,
        xAxisMax,
        yAxisMax,
        numericRange,
      };
    }, [companies, selectedKPI]);

  if (points.length === 0) {
    return (
      <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-grey text-lg">
          {t("companiesOverviewPage.visualizations.noDataAvailable")}
        </p>
      </div>
    );
  }

  const unitLabel = unitScale.unit.trim();
  const bubbleSizeRange: [number, number] = isMobile ? [1, 850] : [1, 1500];
  const parityLineMax = Math.min(xAxisMax, yAxisMax);

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <div className="relative flex-1 min-h-[420px] bg-black-2 rounded-level-2 p-4 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 12, right: 16, bottom: 48, left: 8 }}>
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, xAxisMax]}
              tick={{ fill: COLORS.grey, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: t(
                  "companiesOverviewPage.visualizations.meetsParis.bubbleChart.xAxis",
                  { unit: unitLabel },
                ),
                position: "bottom",
                offset: 24,
                fill: COLORS.grey,
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, yAxisMax]}
              width={56}
              tick={{ fill: COLORS.grey, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: t(
                  "companiesOverviewPage.visualizations.meetsParis.bubbleChart.yAxis",
                  { unit: unitLabel },
                ),
                angle: -90,
                position: "insideLeft",
                offset: 0,
                fill: COLORS.grey,
                fontSize: 12,
              }}
            />
            <ZAxis
              type="number"
              dataKey="z"
              domain={[0, 1]}
              range={bubbleSizeRange}
            />
            <Tooltip content={<BubbleTooltip selectedKPI={selectedKPI} />} />
            <ReferenceLine
              segment={[
                { x: 0, y: 0 },
                { x: parityLineMax, y: parityLineMax },
              ]}
              stroke={COLORS.orange2}
              strokeDasharray="5 5"
              strokeWidth={1.5}
              ifOverflow="extendDomain"
            />
            <Scatter
              data={points}
              onClick={(data) => {
                const point = data?.payload as BubblePoint | undefined;
                if (point) {
                  if (isMobile) {
                    setActiveIndex(points.indexOf(point));
                  } else {
                    onCompanyClick?.(point.company);
                  }
                }
              }}
            >
              {points.map((point, index) => (
                <Cell
                  key={getCompanyUrlSegment(point.company)}
                  fill={point.color}
                  fillOpacity={activeIndex === index ? 1 : 0.75}
                  stroke={
                    activeIndex === index ? COLORS.orange2 : "transparent"
                  }
                  strokeWidth={2}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-grey">
        {selectedKPI.isBoolean ? (
          <>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS.blue3 }}
              />
              {selectedKPI.booleanLabels?.true ?? t("yes")}
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS.pink3 }}
              />
              {selectedKPI.booleanLabels?.false ?? t("no")}
            </div>
          </>
        ) : (
          numericRange && (
            <BeeswarmLegend
              min={numericRange.min}
              max={numericRange.max}
              unit={selectedKPI.unit ?? ""}
            />
          )
        )}
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full border border-dashed"
            style={{ borderColor: COLORS.orange2 }}
          />
          {t(
            "companiesOverviewPage.visualizations.meetsParis.bubbleChart.parityLine",
          )}
        </div>
      </div>
    </div>
  );
}
