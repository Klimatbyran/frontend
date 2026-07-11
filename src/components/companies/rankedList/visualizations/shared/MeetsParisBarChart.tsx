import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useChartMotion } from "@/hooks/useChartMotion";
import { useScreenSize } from "@/hooks/useScreenSize";
import { COLORS } from "@/lib/colors";
import { getCompanyUrlSegment } from "@/utils/companyRouting";
import { formatWithBestUnit } from "@/utils/data/unitScaling";
import type { CompanyParisEmissionsEntry } from "@/utils/insights/meetsParisChartData";

interface MeetsParisBarChartProps {
  entries: CompanyParisEmissionsEntry[];
  unitScale: { unit: string; divisor: number };
  maxEmissions: number;
  onCompanyClick?: (entry: CompanyParisEmissionsEntry) => void;
}

interface ChartRow {
  category: string;
  total: number;
  [companyId: string]: string | number;
}

interface TooltipPayloadItem {
  dataKey?: string;
  value?: number;
  color?: string;
  payload?: ChartRow;
}

interface SegmentPattern {
  id: string;
  baseColor: string;
  variant: number;
  size: number;
  angle: number;
}

function getEntryKey(entry: CompanyParisEmissionsEntry): string {
  return getCompanyUrlSegment(entry.company);
}

function getPatternId(companyId: string): string {
  return `paris-segment-${companyId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

function buildSegmentPatterns(
  companyIds: string[],
  companyById: Map<string, CompanyParisEmissionsEntry>,
): SegmentPattern[] {
  return companyIds.flatMap((companyId, index) => {
    if (!companyId) return [];

    const entry = companyById.get(companyId);
    if (!entry) return [];

    return [
      {
        id: getPatternId(companyId),
        baseColor: entry.meetsParis ? COLORS.blue3 : COLORS.pink3,
        variant: index % 3,
        size: 5 + (index % 4),
        angle: index % 3 === 2 ? 30 + (index % 5) * 12 : 0,
      },
    ];
  });
}

function CompanySegmentPatterns({ patterns }: { patterns: SegmentPattern[] }) {
  return (
    <defs>
      {patterns.map((pattern) => (
        <pattern
          key={pattern.id}
          id={pattern.id}
          width={pattern.size}
          height={pattern.size}
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${pattern.angle})`}
        >
          <rect
            width={pattern.size}
            height={pattern.size}
            fill={pattern.baseColor}
          />
          {pattern.variant === 0 && (
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={pattern.size}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
            />
          )}
          {pattern.variant === 1 && (
            <line
              x1="0"
              y1="0"
              x2={pattern.size}
              y2="0"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
            />
          )}
          {pattern.variant === 2 && (
            <line
              x1="0"
              y1="0"
              x2={pattern.size}
              y2={pattern.size}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
            />
          )}
        </pattern>
      ))}
    </defs>
  );
}

function MeetsParisBarTooltip({
  active,
  payload,
  companyById,
  unitScale,
  maxEmissions,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  companyById: Map<string, CompanyParisEmissionsEntry>;
  unitScale: { unit: string; divisor: number };
  maxEmissions: number;
}) {
  const { t } = useTranslation();

  if (!active || !payload?.length) return null;

  const item = payload[0];
  const companyId = item.dataKey;
  if (!companyId || companyId === "category" || companyId === "total") {
    return null;
  }

  const entry = companyById.get(companyId);
  if (!entry || !item.value) return null;

  const emissions = item.value * unitScale.divisor;
  const meetsParisLabel = entry.meetsParis
    ? t("companies.list.kpis.meetsParis.booleanLabels.true")
    : t("companies.list.kpis.meetsParis.booleanLabels.false");

  return (
    <div className="bg-black/40 backdrop-blur-sm p-4 rounded-2xl text-white pointer-events-none z-50">
      <p className="font-medium text-xl">{entry.company.name}</p>
      <div className="space-y-1 mt-2">
        <p className="text-white/70">
          <span className="text-orange-2">
            {formatWithBestUnit(emissions, maxEmissions)}
          </span>
        </p>
        <p className="text-white/50 text-sm">{meetsParisLabel}</p>
      </div>
    </div>
  );
}

export function MeetsParisBarChart({
  entries,
  unitScale,
  maxEmissions,
  onCompanyClick,
}: MeetsParisBarChartProps) {
  const { t } = useTranslation();
  const { barDuration, reduceMotion } = useChartMotion();
  const { isMobile } = useScreenSize();
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [hoveredCompanyId, setHoveredCompanyId] = useState<string | null>(null);

  const trueLabel = t("companiesOverviewPage.visualizations.meetsParis.yes");
  const falseLabel = t("companiesOverviewPage.visualizations.meetsParis.no");

  const { chartData, companyIds, companyById, maxBarTotal, totalsByCategory } =
    useMemo(() => {
      const yesEntries = entries.filter((entry) => entry.meetsParis);
      const noEntries = entries.filter((entry) => !entry.meetsParis);

      const byId = new Map(
        entries.map((entry) => [getEntryKey(entry), entry]),
      );

      const buildRow = (
        category: string,
        group: CompanyParisEmissionsEntry[],
      ): ChartRow => {
        const row: ChartRow = { category, total: 0 };
        for (const entry of group) {
          const scaled = entry.emissions / unitScale.divisor;
          row[getEntryKey(entry)] = scaled;
          row.total += scaled;
        }
        return row;
      };

      const data = [
        buildRow(trueLabel, yesEntries),
        buildRow(falseLabel, noEntries),
      ];

      const ids = [
        ...yesEntries
          .sort((a, b) => a.emissions - b.emissions)
          .map((entry) => getEntryKey(entry)),
        ...noEntries
          .sort((a, b) => a.emissions - b.emissions)
          .map((entry) => getEntryKey(entry)),
      ];

      const totals = data.map((row) => row.total);

      return {
        chartData: data,
        companyIds: ids,
        companyById: byId,
        maxBarTotal: Math.max(...totals, 0),
        totalsByCategory: new Map(data.map((row) => [row.category, row.total])),
      };
    }, [entries, falseLabel, trueLabel, unitScale.divisor]);

  const segmentPatterns = useMemo(
    () => buildSegmentPatterns(companyIds, companyById),
    [companyById, companyIds],
  );

  const formatAxisTick = useCallback(
    (value: number) => `${value.toFixed(1)}${unitScale.unit}`,
    [unitScale.unit],
  );

  const formatCategoryTotal = useCallback(
    (category: string) => {
      const total = totalsByCategory.get(category);
      if (total == null) return "";
      return formatWithBestUnit(total * unitScale.divisor, maxEmissions);
    },
    [maxEmissions, totalsByCategory, unitScale.divisor],
  );

  const handleBarClick = useCallback(
    (companyId: string) => {
      const entry = companyById.get(companyId);
      if (!entry) return;

      if (isMobile) {
        setActiveCompanyId((current) =>
          current === companyId ? null : companyId,
        );
        return;
      }

      onCompanyClick?.(entry);
    },
    [companyById, isMobile, onCompanyClick],
  );

  const highlightedCompanyId = hoveredCompanyId ?? activeCompanyId;

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col">
      <div className="relative flex-1 border-t border-b border-black-4 pt-4 pb-2">
        <ResponsiveContainer width="100%" height="100%" minHeight={320}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 16, bottom: 4, left: 4 }}
            barCategoryGap="30%"
          >
            <CompanySegmentPatterns patterns={segmentPatterns} />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 13, fill: "rgba(255,255,255,0.75)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatAxisTick}
              domain={[0, maxBarTotal]}
              width={56}
            />
            <Tooltip
              content={(props) => (
                <MeetsParisBarTooltip
                  active={props.active}
                  payload={props.payload as TooltipPayloadItem[] | undefined}
                  companyById={companyById}
                  unitScale={unitScale}
                  maxEmissions={maxEmissions}
                />
              )}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              animationDuration={0}
              isAnimationActive={false}
            />
            {companyIds.map((companyId) => {
              const entry = companyById.get(companyId);
              if (!entry) return null;

              const isHighlighted = highlightedCompanyId === companyId;
              const isDimmed =
                highlightedCompanyId != null &&
                highlightedCompanyId !== companyId;

              return (
                <Bar
                  key={companyId}
                  dataKey={companyId}
                  stackId="emissions"
                  maxBarSize={120}
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={!reduceMotion}
                  animationBegin={0}
                  animationDuration={reduceMotion ? 0 : barDuration * 1000}
                  animationEasing="ease-out"
                  onClick={() => handleBarClick(companyId)}
                  onMouseEnter={() => setHoveredCompanyId(companyId)}
                  onMouseLeave={() => setHoveredCompanyId(null)}
                  className="cursor-pointer"
                >
                  {chartData.map((row) => {
                    const value = row[companyId];
                    if (typeof value !== "number" || value <= 0) {
                      return (
                        <Cell
                          key={`${companyId}-${row.category}`}
                          fill="transparent"
                        />
                      );
                    }

                    return (
                      <Cell
                        key={`${companyId}-${row.category}`}
                        fill={`url(#${getPatternId(companyId)})`}
                        fillOpacity={isDimmed ? 0.45 : 1}
                        stroke={
                          isHighlighted
                            ? "rgba(255,255,255,0.9)"
                            : "var(--black-4)"
                        }
                        strokeWidth={isHighlighted ? 2 : 1}
                      />
                    );
                  })}
                </Bar>
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: COLORS.blue3 }}
              />
              <span className="text-xs text-white/40">
                {trueLabel}{" "}
                <span className="text-orange-2">
                  ({formatCategoryTotal(trueLabel)})
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: COLORS.pink3 }}
              />
              <span className="text-xs text-white/40">
                {falseLabel}{" "}
                <span className="text-orange-2">
                  ({formatCategoryTotal(falseLabel)})
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 text-xs text-grey px-1">
            <span>
              {t(
                "companiesOverviewPage.visualizations.meetsParis.companiesCount",
                {
                  count: entries.length,
                },
              )}
            </span>
            <span>
              {t(
                "companiesOverviewPage.visualizations.meetsParis.emissionsUnit",
              )}
            </span>
          </div>
        </div>

        <p className="text-xs text-white/40 text-center md:text-left px-1">
          {t("companiesOverviewPage.visualizations.meetsParis.segmentHint")}
        </p>
      </div>

      {isMobile && activeCompanyId && companyById.has(activeCompanyId) && (
        <button
          type="button"
          className="mt-3 w-full rounded-level-2 bg-black-1 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-white/5"
          onClick={() => onCompanyClick?.(companyById.get(activeCompanyId)!)}
        >
          <span className="font-medium">
            {companyById.get(activeCompanyId)!.company.name}
          </span>
          <span className="mt-1 block text-orange-2">
            {formatWithBestUnit(
              companyById.get(activeCompanyId)!.emissions,
              maxEmissions,
            )}
          </span>
        </button>
      )}
    </div>
  );
}
