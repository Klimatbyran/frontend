import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatPercent,
} from "@/utils/formatting/localization";

export interface SectorBarChartItem {
  name: string;
  value: number;
  color: string;
  sectorCode?: string;
  wikidataId?: string;
  total?: number;
}

interface SectorEmissionsBarChartProps {
  data: SectorBarChartItem[];
  onItemClick?: (item: SectorBarChartItem) => void;
  height?: number;
}

function BarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: SectorBarChartItem }>;
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!active || !payload?.length) return null;

  const item = payload[0].payload;
  const percent =
    item.total && item.total > 0
      ? formatPercent(item.value / item.total, currentLanguage)
      : null;

  return (
    <div className="bg-black-2 border border-black-1 rounded-lg shadow-xl p-3 text-white">
      <p className="text-sm font-medium mb-1">{item.name}</p>
      <div className="text-sm text-grey">
        {formatEmissionsAbsolute(Math.round(item.value), currentLanguage)}{" "}
        {t("emissionsUnit")}
        {percent && (
          <span className="ml-1">
            · {percent} {t("graphs.pieChart.ofTotal")}
          </span>
        )}
      </div>
    </div>
  );
}

export function SectorEmissionsBarChart({
  data,
  onItemClick,
  height = 320,
}: SectorEmissionsBarChartProps) {
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const barHeight = Math.max(36, Math.min(48, height / sortedData.length));

  return (
    <ResponsiveContainer width="100%" height={sortedData.length * barHeight + 40}>
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fill: "var(--grey)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
        <Bar
          dataKey="value"
          radius={[0, 4, 4, 0]}
          cursor="pointer"
          onClick={(_, index) => {
            const item = sortedData[index];
            if (item) onItemClick?.(item);
          }}
        >
          {sortedData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
