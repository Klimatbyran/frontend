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
import { summarizeParisAlignment } from "@/utils/visualizations/emissionsDistribution";

interface ParisAlignmentChartProps {
  values: Array<boolean | null | undefined>;
}

const COLORS = {
  yes: "var(--blue-3)",
  no: "var(--pink-3)",
  unknown: "var(--grey)",
} as const;

export function ParisAlignmentChart({ values }: ParisAlignmentChartProps) {
  const { t } = useTranslation();
  const summary = useMemo(() => summarizeParisAlignment(values), [values]);

  const chartData = [
    {
      id: "yes",
      label: t("companies.list.kpis.meetsParis.booleanLabels.true"),
      count: summary.yesCount,
      fill: COLORS.yes,
    },
    {
      id: "no",
      label: t("companies.list.kpis.meetsParis.booleanLabels.false"),
      count: summary.noCount,
      fill: COLORS.no,
    },
    {
      id: "unknown",
      label: t("companies.list.kpis.meetsParis.nullValues"),
      count: summary.unknownCount,
      fill: COLORS.unknown,
    },
  ].filter((item) => item.count > 0);

  const knownTotal = summary.yesCount + summary.noCount;
  const yesPercent =
    knownTotal > 0 ? Math.round((summary.yesCount / knownTotal) * 100) : 0;

  if (summary.total === 0) {
    return null;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-2">
        <h3 className="text-base font-medium text-white">
          {t("companies.list.kpis.meetsParis.label")}
        </h3>
        <p className="text-sm text-grey leading-relaxed">
          {knownTotal > 0
            ? t("companiesOverviewPage.visualizations.meetsParis.summary", {
                yes: summary.yesCount,
                total: knownTotal,
                percent: yesPercent,
              })
            : t(
                "companiesOverviewPage.visualizations.meetsParis.summaryUnknownOnly",
                { unknown: summary.unknownCount },
              )}
        </p>
        <p className="text-xs text-grey">
          {t("companiesOverviewPage.visualizations.meetsParis.description")}{" "}
          <a
            href="/methodology?view=companyDataOverview"
            className="underline hover:text-white"
          >
            {t("companiesOverviewPage.visualizations.meetsParis.learnMore")}
          </a>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label={t("companies.list.kpis.meetsParis.booleanLabels.true")}
          value={summary.yesCount}
          accentClass="text-blue-3"
        />
        <SummaryCard
          label={t("companies.list.kpis.meetsParis.booleanLabels.false")}
          value={summary.noCount}
          accentClass="text-pink-3"
        />
        <SummaryCard
          label={t("companies.list.kpis.meetsParis.nullValues")}
          value={summary.unknownCount}
        />
      </div>

      <div className="min-h-[220px] flex-1 rounded-level-2 bg-black-3/40 p-4">
        <p className="mb-3 text-xs text-grey">
          {t("companiesOverviewPage.visualizations.meetsParis.axisLabel")}
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid
              stroke="var(--black-4)"
              strokeDasharray="3 3"
              horizontal={false}
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: "var(--grey)", fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={140}
              tick={{ fill: "var(--grey)", fontSize: 11 }}
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
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
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
  value: number;
  accentClass?: string;
}) {
  return (
    <div className="rounded-level-2 bg-black-3/60 px-3 py-3">
      <p className="text-xs text-grey">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
}
