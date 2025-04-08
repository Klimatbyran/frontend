import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Text } from "@/components/ui/text";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface RealEstateScope3HistoryProps {
  data: Array<{
    year: number;
    categories: Array<{
      category: number;
      total: number;
      unit: string;
    }>;
  }>;
  className?: string;
}

export function RealEstateScope3History({
  data,
  className,
}: RealEstateScope3HistoryProps) {
  const { t } = useTranslation();

  const categoryNames: Record<number, string> = {
    1: t("companies.categories.purchasedGoodsAndServices"),
    2: t("companies.categories.capitalGoods"),
    3: t("companies.categories.fuelAndEnergy"),
    4: t("companies.categories.upstreamTransport"),
    5: t("companies.categories.waste"),
    6: t("companies.categories.businessTravel"),
    7: t("companies.categories.commuting"),
    8: t("companies.categories.upstreamLeasing"),
    9: t("companies.categories.downstreamTransport"),
    10: t("companies.categories.processing"),
    11: t("companies.categories.use"),
    12: t("companies.categories.endOfLifeTreatment"),
    13: t("companies.categories.downstreamLeasing"),
    14: t("companies.categories.franchises"),
    15: t("companies.categories.investments"),
  };

  // Colors for different categories
  const COLORS = [
    "var(--blue-2)",
    "var(--blue-3)",
    "var(--orange-2)",
    "var(--orange-3)",
    "var(--pink-2)",
    "var(--pink-3)",
    "var(--green-2)",
    "var(--green-3)",
  ];

  // Transform data for the chart
  const chartData = data.map((yearData) => {
    const dataPoint: any = { year: yearData.year };
    yearData.categories.forEach((cat) => {
      dataPoint[`cat${cat.category}`] = cat.total;
      dataPoint[`cat${cat.category}Name`] = categoryNames[cat.category];
    });
    return dataPoint;
  });

  // Get unique categories across all years
  const uniqueCategories = Array.from(
    new Set(
      data.flatMap((yearData) =>
        yearData.categories.map((cat) => cat.category),
      ),
    ),
  ).sort();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black-1 px-4 py-3 rounded-level-2">
          <Text variant="small" className="text-grey mb-2">
            {label}
          </Text>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <Text variant="small">
                  {entry.payload[`cat${entry.name.replace("cat", "")}Name`]}:
                </Text>
                <Text variant="small" className="font-medium">
                  {Math.round(entry.value).toLocaleString()}{" "}
                  {t("realEstateScope3History.tonsCO2e")}
                </Text>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("bg-black-2 rounded-level-1 p-16", className)}>
      <div className="flex items-center gap-2 mb-12">
        <Text variant="h3">{t("realEstateScope3History.title")}</Text>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-grey" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("realEstateScope3History.tooltip")}</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>

      <div className="h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="year"
              stroke="#878787"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="#878787"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              width={80}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={72}
              formatter={(value) =>
                categoryNames[parseInt(value.replace("cat", ""))]
              }
            />
            {uniqueCategories.map((category, index) => (
              <Line
                key={category}
                type="monotone"
                dataKey={`cat${category}`}
                name={`cat${category}`}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 p-6 bg-black-1 rounded-level-2">
        <Text variant="h4" className="mb-2">
          {t("realEstateScope3History.keyTrendsTitle")}
        </Text>
        <Text variant="muted">
          {t("realEstateScope3History.keyTrendsDescription")}
        </Text>
      </div>
    </div>
  );
}
