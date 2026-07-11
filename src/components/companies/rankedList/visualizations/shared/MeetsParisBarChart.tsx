import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useChartMotion } from "@/hooks/useChartMotion";
import { useScreenSize } from "@/hooks/useScreenSize";
import { getCompanyColors } from "@/lib/constants/companyColors";
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
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const companyId = item.dataKey;
  if (!companyId || companyId === "category" || companyId === "total") {
    return null;
  }

  const entry = companyById.get(companyId);
  if (!entry || !item.value) return null;

  const emissions = item.value * unitScale.divisor;

  return (
    <div className="bg-black-2 border border-black-1 rounded-lg shadow-xl p-4 text-white pointer-events-none z-50">
      <p className="text-sm font-medium mb-1">{entry.company.name}</p>
      <p className="text-sm text-grey">
        {formatWithBestUnit(emissions, maxEmissions)}
      </p>
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

  const trueLabel = t("companiesOverviewPage.visualizations.meetsParis.yes");
  const falseLabel = t("companiesOverviewPage.visualizations.meetsParis.no");

  const {
    chartData,
    companyIds,
    colorById,
    companyById,
    maxBarTotal,
  } = useMemo(() => {
    const yesEntries = entries.filter((entry) => entry.meetsParis);
    const noEntries = entries.filter((entry) => !entry.meetsParis);

    const sortedAll = [...entries].sort((a, b) => b.emissions - a.emissions);
    const colors = new Map(
      sortedAll.map((entry, index) => [
        entry.company.wikidataId,
        getCompanyColors(index).base,
      ]),
    );
    const byId = new Map(
      entries.map((entry) => [entry.company.wikidataId, entry]),
    );

    const buildRow = (
      category: string,
      group: CompanyParisEmissionsEntry[],
    ): ChartRow => {
      const row: ChartRow = { category, total: 0 };
      for (const entry of group) {
        const scaled = entry.emissions / unitScale.divisor;
        row[entry.company.wikidataId] = scaled;
        row.total += scaled;
      }
      return row;
    };

    const data = [
      buildRow(trueLabel, yesEntries),
      buildRow(falseLabel, noEntries),
    ];
    const ids = sortedAll.map((entry) => entry.company.wikidataId);
    const totals = data.map((row) => row.total);
    const maxTotal = Math.max(...totals, 0);

    return {
      chartData: data,
      companyIds: ids,
      colorById: colors,
      companyById: byId,
      maxBarTotal: maxTotal,
    };
  }, [entries, falseLabel, trueLabel, unitScale.divisor]);

  const formatAxisTick = useCallback(
    (value: number) => `${value.toFixed(1)}${unitScale.unit}`,
    [unitScale.unit],
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

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col">
      <ResponsiveContainer width="100%" height="100%" minHeight={360}>
        <BarChart
          data={chartData}
          margin={{ top: 16, right: 12, bottom: 8, left: 4 }}
        >
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
          />
          {companyIds.map((companyId) => (
            <Bar
              key={companyId}
              dataKey={companyId}
              stackId="emissions"
              fill={colorById.get(companyId)}
              isAnimationActive={!reduceMotion}
              animationBegin={0}
              animationDuration={reduceMotion ? 0 : barDuration * 1000}
              animationEasing="ease-out"
              onClick={() => handleBarClick(companyId)}
              className="cursor-pointer"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-between text-xs text-grey px-1">
        <span>
          {t("companiesOverviewPage.visualizations.meetsParis.companiesCount", {
            count: entries.length,
          })}
        </span>
        <span>
          {t("companiesOverviewPage.visualizations.meetsParis.emissionsUnit")}
        </span>
      </div>

      {isMobile && activeCompanyId && companyById.has(activeCompanyId) && (
        <button
          type="button"
          className="mt-3 w-full rounded-level-2 bg-black-1 px-4 py-3 text-left text-sm text-white"
          onClick={() => onCompanyClick?.(companyById.get(activeCompanyId)!)}
        >
          <span className="font-medium">
            {companyById.get(activeCompanyId)!.company.name}
          </span>
          <span className="mt-1 block text-grey">
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
