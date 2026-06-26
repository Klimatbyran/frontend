/**
 * Shared UI building blocks used by all three entity InsightsPanels
 * (municipalities, regions, companies).
 */
import { useTranslation } from "react-i18next";
import { COLORS } from "@/lib/colors";

interface DistributionStat {
  count: number;
  colorClass: string;
  label: string;
}

interface DistributionBoxProps {
  /** The chart or visualisation to display at the bottom */
  chart: React.ReactNode;
}

/** Titled box that places a description at the top and a chart at the bottom. */
export function DistributionBox({ chart }: DistributionBoxProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white/5 rounded-level-2 p-6 flex flex-col justify-between h-full gap-6">
      <div>
        <h3 className="text-2xl font-bold text-white">
          {t("municipalities.list.insights.distribution.title")}
        </h3>
        <p className="text-sm text-white/60 leading-relaxed mt-2">
          {t("municipalities.list.insights.distribution.subtitle")}
        </p>
      </div>
      {chart}
    </div>
  );
}

interface BooleanSummaryBoxProps {
  distributionStats: DistributionStat[];
}

/** Large yes/no count display for boolean KPIs. */
export function BooleanSummaryBox({ distributionStats }: BooleanSummaryBoxProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white/5 rounded-level-2 p-6 flex flex-col justify-center gap-6 h-full">
      <h3 className="text-lg font-semibold text-white">
        {t("municipalities.list.insights.distribution.summary")}
      </h3>
      {distributionStats.map((stat, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="text-4xl font-bold"
            style={{ color: i === 0 ? COLORS.blue3 : COLORS.pink3 }}
          >
            {stat.count}
          </div>
          <div className="text-white/70 text-sm leading-tight">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
