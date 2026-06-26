import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { TrendData } from "@/types/company";
import { useCategoryInfo } from "@/hooks/companies/useTrendAnalysis";
import { useLanguage } from "@/components/LanguageProvider";
import { formatPercent } from "@/utils/formatting/localization";

interface TrendDistributionChartProps {
  trends: TrendData;
  selectedCategory: "decreasing" | "increasing" | "noComparable" | null;
  onCategorySelect: (
    category: "decreasing" | "increasing" | "noComparable" | null,
  ) => void;
}

const CATEGORY_COLORS = {
  decreasing: "var(--green-3)",
  increasing: "var(--orange-3)",
  noComparable: "var(--blue-3)",
};

export function TrendDistributionChart({
  trends,
  selectedCategory,
  onCategorySelect,
}: TrendDistributionChartProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const categoryInfo = useCategoryInfo();

  const chartData = (Object.keys(trends) as Array<keyof TrendData>).map(
    (key) => ({
      key,
      name: categoryInfo[key].title,
      value: trends[key].length,
      color: CATEGORY_COLORS[key],
    }),
  );

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-grey text-sm">
        {t("sectorsOverviewPage.noTrendData")}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="relative w-48 h-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={2}
              stroke="none"
              onClick={(_, index) => {
                const key = chartData[index]?.key;
                if (key) {
                  onCategorySelect(selectedCategory === key ? null : key);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={entry.color}
                  opacity={
                    selectedCategory && selectedCategory !== entry.key
                      ? 0.35
                      : 1
                  }
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as (typeof chartData)[0];
                return (
                  <div className="bg-black-2 border border-black-1 rounded-lg p-3 text-sm text-white">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-grey">
                      {item.value}{" "}
                      {formatPercent(item.value / total, currentLanguage)}
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-light text-white">{total}</span>
          <span className="text-xs text-grey">
            {t("sectorsOverviewPage.stats.companies")}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-2">
        {chartData.map((entry) => {
          const Icon = categoryInfo[entry.key].icon;
          const isSelected = selectedCategory === entry.key;
          const percent = entry.value / total;

          return (
            <button
              key={entry.key}
              type="button"
              onClick={() => onCategorySelect(isSelected ? null : entry.key)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                isSelected
                  ? "bg-black-1 ring-1 ring-white/20"
                  : "bg-black-1/50 hover:bg-black-1"
              }`}
            >
              <div
                className={`rounded-full p-1.5 ${categoryInfo[entry.key].color}`}
              >
                <Icon
                  className={`h-4 w-4 ${categoryInfo[entry.key].textColor}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-white truncate">
                    {entry.name}
                  </span>
                  <span className="text-sm font-medium text-white shrink-0">
                    {entry.value}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 bg-black-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent * 100}%`,
                      backgroundColor: entry.color,
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
