import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
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
import type { CompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
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

interface ParisBubbleChartProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

interface BubblePoint {
  company: CompanyWithKPIs;
  x: number;
  y: number;
  z: number;
  meetsParis: boolean | null;
  parisBudgetRaw: number;
  trendTotalRaw: number;
  emissions2025Raw: number;
}

interface BubbleTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: BubblePoint }>;
  maxValue: number;
}

function BubbleTooltip({ active, payload, maxValue }: BubbleTooltipProps) {
  const { t } = useTranslation();

  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  const formatTonnes = (value: number) =>
    formatWithBestUnit(value, maxValue);

  const meetsParisLabel =
    point.meetsParis === true
      ? t("companies.list.kpis.meetsParis.booleanLabels.true")
      : point.meetsParis === false
        ? t("companies.list.kpis.meetsParis.booleanLabels.false")
        : t("companies.list.kpis.meetsParis.nullValues");

  return (
    <div className="rounded-2xl bg-black/80 backdrop-blur-sm border border-black-3 p-4 text-sm shadow-lg">
      <p className="font-medium text-white text-base mb-2">
        {point.company.name}
      </p>
      <div className="space-y-1 text-white/70">
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
        <p className="pt-1">
          <span className="text-orange-2">{meetsParisLabel}</span>
        </p>
      </div>
    </div>
  );
}

export function ParisBubbleChart({
  companies,
  onCompanyClick,
}: ParisBubbleChartProps) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { points, unitScale, axisMax, maxRawValue } = useMemo(() => {
    const rawPoints: Array<{
      company: CompanyWithKPIs;
      parisBudgetRaw: number;
      trendTotalRaw: number;
      emissions2025Raw: number;
      meetsParis: boolean | null;
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
        meetsParis: company.meetsParis ?? null,
      });
    });

    const maxRawValue = Math.max(
      0,
      ...rawPoints.flatMap((point) => [
        point.parisBudgetRaw,
        point.trendTotalRaw,
      ]),
    );
    const unitScale = getBestUnit(maxRawValue);

    const points: BubblePoint[] = rawPoints.map((point) => ({
      ...point,
      x: point.parisBudgetRaw / unitScale.divisor,
      y: point.trendTotalRaw / unitScale.divisor,
      z: point.emissions2025Raw,
    }));

    const axisMax =
      Math.ceil((maxRawValue / unitScale.divisor) * 1.05 * 10) / 10;

    return { points, unitScale, axisMax, maxRawValue };
  }, [companies]);

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

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <div className="relative flex-1 min-h-[420px] bg-black-2 rounded-level-2 p-4 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 12, right: 16, bottom: 48, left: 8 }}>
            <CartesianGrid stroke={COLORS.black1} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, axisMax]}
              tick={{ fill: COLORS.grey, fontSize: 11 }}
              axisLine={{ stroke: COLORS.black1 }}
              tickLine={{ stroke: COLORS.black1 }}
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
              domain={[0, axisMax]}
              width={56}
              tick={{ fill: COLORS.grey, fontSize: 11 }}
              axisLine={{ stroke: COLORS.black1 }}
              tickLine={{ stroke: COLORS.black1 }}
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
            <ZAxis type="number" dataKey="z" range={[48, 320]} />
            <Tooltip
              content={<BubbleTooltip maxValue={maxRawValue} />}
              cursor={{ strokeDasharray: "3 3", stroke: COLORS.grey }}
            />
            <ReferenceLine
              segment={[
                { x: 0, y: 0 },
                { x: axisMax, y: axisMax },
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
                  fill={
                    point.meetsParis === true
                      ? COLORS.blue3
                      : point.meetsParis === false
                        ? COLORS.pink3
                        : COLORS.grey
                  }
                  fillOpacity={activeIndex === index ? 1 : 0.75}
                  stroke={activeIndex === index ? COLORS.orange2 : "transparent"}
                  strokeWidth={2}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-grey">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: COLORS.blue3 }}
          />
          {t("companies.list.kpis.meetsParis.booleanLabels.true")}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: COLORS.pink3 }}
          />
          {t("companies.list.kpis.meetsParis.booleanLabels.false")}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full border border-dashed"
            style={{ borderColor: COLORS.orange2 }}
          />
          {t(
            "companiesOverviewPage.visualizations.meetsParis.bubbleChart.parityLine",
          )}
        </div>
        <span>
          {t(
            "companiesOverviewPage.visualizations.meetsParis.bubbleChart.sizeLegend",
          )}
        </span>
      </div>
    </div>
  );
}
