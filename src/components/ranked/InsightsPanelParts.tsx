/**
 * Shared UI building blocks used by all three entity InsightsPanels
 * (municipalities, regions, companies).
 */
import { useTranslation } from "react-i18next";
import { COLORS } from "@/lib/colors";

const STAT_COLOR_MAP: Record<string, string> = {
  "text-blue-3": COLORS.blue3,
  "text-pink-3": COLORS.pink3,
  "text-green-3": COLORS.green3,
  "text-orange-2": COLORS.orange2,
};

interface DistributionStat {
  count: number;
  colorClass: string;
  label: string;
}

interface DistributionBoxProps {
  /** The chart or visualisation to display at the bottom */
  chart: React.ReactNode;
  /** Override the default title (falls back to distribution.title key) */
  title?: string;
  /** Override the default subtitle (falls back to distribution.subtitle key) */
  subtitle?: string;
  /** When false, uses subtitleNoAverage which omits the dashed-line mention */
  showAverageLine?: boolean;
}

/** Titled box that places a description at the top and a chart at the bottom. */
export function DistributionBox({
  chart,
  title,
  subtitle,
  showAverageLine = true,
}: DistributionBoxProps) {
  const { t } = useTranslation();
  const distributionKey = "municipalities.list.insights.distribution";
  return (
    <div className="bg-white/5 rounded-level-2 p-6 flex flex-col justify-between h-full gap-6">
      <div>
        <h3 className="text-2xl font-bold text-white">
          {title ?? t(`${distributionKey}.title`)}
        </h3>
        <p className="text-sm text-white/60 leading-relaxed mt-2">
          {subtitle ??
            t(
              showAverageLine
                ? `${distributionKey}.subtitle`
                : `${distributionKey}.subtitleNoAverage`,
            )}
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
export function BooleanSummaryBox({
  distributionStats,
}: BooleanSummaryBoxProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white/5 rounded-level-2 p-6 flex flex-col justify-center gap-6 h-full">
      <h3 className="text-lg font-semibold text-white">
        {t("municipalities.list.insights.distribution.summary")}
      </h3>
      {distributionStats.map((stat, i) => (
        <div key={stat.label || i} className="flex items-center gap-3">
          <div
            className="text-4xl font-bold"
            style={{ color: STAT_COLOR_MAP[stat.colorClass] ?? COLORS.grey }}
          >
            {stat.count}
          </div>
          <div className="text-white/70 text-sm leading-tight">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
