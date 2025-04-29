import { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import {
  formatEmissionsAbsolute,
  formatPercent,
} from "@/utils/localizeUnit";

interface Scope3ChartProps {
  categories: Array<{
    category: number;
    total: number;
    unit: string;
  }>;
  className?: string;
}

export function Scope3Chart({ categories, className }: Scope3ChartProps) {
  const [excludedCategories, setExcludedCategories] = useState<number[]>([]);
  const { getCategoryName, getCategoryColor, getCategoryFilterColors } =
    useCategoryMetadata();
  const { size, containerRef } = useResponsiveChartSize(true);
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const filteredCategories = categories.filter(
    (cat) => !excludedCategories.includes(cat.category),
  );
  const total = filteredCategories.reduce((sum, cat) => sum + cat.total, 0);

  const chartData = filteredCategories
    .sort((a, b) => b.total - a.total)
    .map((cat) => ({
      name: getCategoryName(cat.category),
      shortName: getCategoryName(cat.category),
      value: cat.total,
      percentage: (cat.total / total) * 100,
      category: cat.category,
      color: getCategoryColor(cat.category),
    }));

  const handleCategoryClick = (category: number) => {
    setExcludedCategories((prev) => [...prev, category]);
  };

  const handleCategoryRestore = (category: number) => {
    setExcludedCategories((prev) => prev.filter((id) => id !== category));
  };

  const handleReset = () => {
    setExcludedCategories([]);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black-1 px-4 py-3 rounded-level-2">
          <Text variant="small" className="text-grey">
            {t("companies.scope3Chart.category", { number: data.category })}
          </Text>
          <Text variant="h4">{data.name}</Text>
          <Text>
            {formatEmissionsAbsolute(Math.round(data.value), currentLanguage)}{" "}
            {t("emissionsUnit")}
          </Text>
          <Text className="text-grey">
            ({formatPercent(data.percentage / 100, currentLanguage)})
          </Text>
          <Text variant="small" className="text-blue-2 mt-2">
            {t("companies.scope3Chart.clickToFilter")}
          </Text>
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const radius = outerRadius * 1.35;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const anchor = x > cx ? "start" : "end";
    const percentage = formatPercent(percent, currentLanguage);
    const data = chartData[index];

    // Split the category name into words
    const words = data.name.split(" ");
    const firstLine = words.slice(0, 2).join(" ");
    const secondLine = words.slice(2).join(" ");

    return (
      <text
        x={x}
        y={y}
        fill="#878787"
        textAnchor={anchor}
        dominantBaseline="central"
        fontSize={12}
      >
        <tspan x={x} dy="-8">
          {firstLine}
        </tspan>
        {secondLine && (
          <tspan x={x} dy="16">
            {secondLine}
          </tspan>
        )}
        <tspan x={x} dy="16">
          {percentage}
        </tspan>
      </text>
    );
  };

  return (
    <div
      className={cn("bg-black-2 rounded-level-1 p-4 md:p-8 lg:p-8", className)}
    >
      {excludedCategories.length > 0 && (
        <div className="mb-2 p-4 bg-black-1 rounded-level-2">
          <Text variant="small" className="text-grey">
            {t("companies.scope3Chart.showingCategories", {
              shown: chartData.length,
              total: categories.length,
            })}
          </Text>
          <div className="mt-2 flex flex-wrap gap-2">
            {excludedCategories.map((catId) => {
              const colors = getCategoryFilterColors(catId);
              return (
                <div
                  key={catId}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
                    colors.bg,
                    colors.text,
                  )}
                >
                  <span>{getCategoryName(catId)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryRestore(catId);
                    }}
                    className={cn(
                      "p-0.5 rounded-full transition-colors",
                      `hover:${colors.bg}`,
                    )}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1" />
        {excludedCategories.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {t("companies.scope3Chart.resetAll")}
          </Button>
        )}
      </div>

      <div
        ref={containerRef}
        className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={size.innerRadius}
              outerRadius={size.outerRadius}
              cornerRadius={8}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={size.showLabels ? renderCustomizedLabel : undefined}
              labelLine={false}
              onClick={(entry) => handleCategoryClick(entry.category)}
              className="cursor-pointer"
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.category}`}
                  fill={entry.color}
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
