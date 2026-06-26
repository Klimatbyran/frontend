import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { formatPercent } from "@/utils/formatting/localization";
import { ScopeData } from "@/hooks/companies/useScopeData";
import { Truck, Factory, ShoppingBag } from "lucide-react";

interface ScopeValueChainChartProps {
  scopeData: ScopeData;
  totalEmissions: number;
}

export function ScopeValueChainChart({
  scopeData,
  totalEmissions,
}: ScopeValueChainChartProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const upstream = scopeData.scope3.upstream.total;
  const operations = scopeData.scope1.total + scopeData.scope2.total;
  const downstream = scopeData.scope3.downstream.total;

  const segments = [
    {
      key: "upstream",
      icon: Truck,
      color: "var(--blue-3)",
      bgColor: "bg-blue-5",
      iconColor: "text-blue-3",
      title: t("companyDetailPage.sectorGraphs.upstream"),
      value: upstream,
    },
    {
      key: "operations",
      icon: Factory,
      color: "var(--orange-3)",
      bgColor: "bg-orange-5",
      iconColor: "text-orange-3",
      title: t("companyDetailPage.sectorGraphs.operations"),
      value: operations,
    },
    {
      key: "downstream",
      icon: ShoppingBag,
      color: "var(--green-3)",
      bgColor: "bg-green-5",
      iconColor: "text-green-3",
      title: t("companyDetailPage.sectorGraphs.downstream"),
      value: downstream,
    },
  ];

  const maxValue = Math.max(...segments.map((s) => s.value), 1);

  if (totalEmissions <= 0) return null;

  return (
    <div className="bg-black-2 rounded-lg p-4 md:p-6">
      <h3 className="text-base font-light text-white mb-4">
        {t("sectorsOverviewPage.valueChainTitle")}
      </h3>

      <div className="space-y-4">
        {segments.map((segment) => {
          const Icon = segment.icon;
          const percent =
            totalEmissions > 0 ? segment.value / totalEmissions : 0;
          const barWidth = (segment.value / maxValue) * 100;

          return (
            <div key={segment.key} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`rounded-full p-1.5 ${segment.bgColor}`}>
                    <Icon className={`h-4 w-4 ${segment.iconColor}`} />
                  </div>
                  <span className="text-sm text-white truncate">
                    {segment.title}
                  </span>
                </div>
                <span
                  className="text-sm font-medium shrink-0"
                  style={{ color: segment.color }}
                >
                  {formatPercent(percent, currentLanguage)}
                </span>
              </div>
              <div className="h-8 bg-black-1 rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                  style={{
                    width: `${Math.max(barWidth, percent > 0 ? 4 : 0)}%`,
                    backgroundColor: segment.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
