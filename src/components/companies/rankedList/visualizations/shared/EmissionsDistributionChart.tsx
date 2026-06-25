import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildDistributionBins,
  summarizeEmissionsChange,
} from "@/utils/visualizations/emissionsDistribution";

interface EmissionsDistributionChartProps {
  values: number[];
  unknownCount: number;
}

const REDUCTION_COLOR = "var(--blue-3)";
const INCREASE_COLOR = "var(--pink-3)";

export function EmissionsDistributionChart({
  values,
  unknownCount,
}: EmissionsDistributionChartProps) {
  const { t } = useTranslation();

  const bins = useMemo(() => buildDistributionBins(values), [values]);
  const summary = useMemo(() => summarizeEmissionsChange(values), [values]);

  const chartData = bins.map((bin) => ({
    id: bin.id,
    label: t(
      `companiesOverviewPage.visualizations.emissionsChange.bins.${bin.id}`,
    ),
    count: bin.count,
    fill: bin.isReduction ? REDUCTION_COLOR : INCREASE_COLOR,
  }));

  if (values.length === 0) {
    return null;
  }

  const reducedPercent = Math.round(
    (summary.reducedCount / summary.totalWithData) * 100,
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-2">
        <h3 className="text-base font-medium text-white">
          {t("companiesOverviewPage.visualizations.emissionsChange.title")}
        </h3>
        <p className="text-sm text-grey leading-relaxed">
          {t(
            "companiesOverviewPage.visualizations.emissionsChange.summary",
            {
              reduced: summary.reducedCount,
              total: summary.totalWithData,
              percent: reducedPercent,
              median:
                summary.median !== null
                  ? `${summary.median.toFixed(1)}%`
                  : t("noData"),
            },
          )}
        </p>
        <p className="text-xs text-grey">
          {t(
            "companiesOverviewPage.visualizations.emissionsChange.description",
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard
          label={t(
            "companiesOverviewPage.visualizations.emissionsChange.cards.reduced",
          )}
          value={summary.reducedCount}
          accentClass="text-blue-3"
        />
        <SummaryCard
          label={t(
            "companiesOverviewPage.visualizations.emissionsChange.cards.increased",
          )}
          value={summary.increasedCount}
          accentClass="text-pink-3"
        />
        <SummaryCard
          label={t(
            "companiesOverviewPage.visualizations.emissionsChange.cards.average",
          )}
          value={
            summary.average !== null
              ? `${summary.average.toFixed(1)}%`
              : t("noData")
          }
        />
        <SummaryCard
          label={t(
            "companiesOverviewPage.visualizations.emissionsChange.cards.unknown",
          )}
          value={unknownCount}
        />
      </div>

      <div className="min-h-[280px] flex-1 rounded-level-2 bg-black-3/40 p-4">
        <p className="mb-3 text-xs text-grey">
          {t(
            "companiesOverviewPage.visualizations.emissionsChange.axisLabel",
          )}
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
          >
            <CartesianGrid
              stroke="var(--black-4)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--grey)", fontSize: 11 }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "var(--grey)", fontSize: 11 }}
              width={32}
              label={{
                value: t(
                  "companiesOverviewPage.visualizations.emissionsChange.yAxis",
                ),
                angle: -90,
                position: "insideLeft",
                fill: "var(--grey)",
                fontSize: 11,
                dx: 10,
              }}
            />
            <Tooltip
              cursor={{ fill: "var(--black-4)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const item = payload[0].payload as (typeof chartData)[number];

                return (
                  <div className="rounded-level-1 border border-black-4 bg-black-1 px-3 py-2 text-xs text-white shadow-lg">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-grey">
                      {t(
                        "companiesOverviewPage.visualizations.emissionsChange.tooltipCount",
                        { count: item.count },
                      )}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.id} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accentClass = "text-white",
}: {
  label: string;
  value: number | string;
  accentClass?: string;
}) {
  return (
    <div className="rounded-level-2 bg-black-3/60 px-3 py-3">
      <p className="text-xs text-grey">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
}
