import React from "react";
import { ArrowUpRight, Factory, ArrowDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPercent } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { ScopeData } from "@/hooks/companies/useScopeData";

interface KeyInsightsProps {
  scopeData: ScopeData;
  totalEmissions: number;
}

interface InsightItem {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  title: string;
  description: (value: string) => string;
  value: number;
  total: number;
}

const KeyInsights: React.FC<KeyInsightsProps> = ({
  scopeData,
  totalEmissions,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const insights: InsightItem[] = [
    {
      icon: ArrowUpRight,
      iconColor: "text-blue-3",
      bgColor: "bg-blue-5",
      title: t("companiesPage.sectorGraphs.supplyChainImpact"),
      description: (value) =>
        `${t("companiesPage.sectorGraphs.scope3UpstreamDetails")}${value}${t(
          "companiesPage.sectorGraphs.ofTotalEmissionsDescription",
        )}`,
      value: scopeData.scope3.upstream.total,
      total: totalEmissions,
    },
    {
      icon: Factory,
      iconColor: "text-orange-3",
      bgColor: "bg-orange-5",
      title: t("companiesPage.sectorGraphs.operationalFootprint"),
      description: (value) =>
        `${t(
          "companiesPage.sectorGraphs.directEmissionsDescription",
        )}${value}${t(
          "companiesPage.sectorGraphs.ofTotalFootprintDescription",
        )}`,
      value: scopeData.scope1.total,
      total: totalEmissions,
    },
    {
      icon: ArrowDownRight,
      iconColor: "text-green-3",
      bgColor: "bg-green-5",
      title: t("companiesPage.sectorGraphs.productLifecycle"),
      description: (value) =>
        `${t(
          "companiesPage.sectorGraphs.downstreamActivitiesDescription",
        )}${value}${t("companiesPage.sectorGraphs.toTotalEmissions")}`,
      value: scopeData.scope3.downstream.total,
      total: totalEmissions,
    },
  ];

  return (
    <div className="bg-black-1 light:bg-grey/20 border border-black-2 light:border-grey/20 rounded-lg p-6">
      <h3 className="text-lg font-light text-white light:text-black-3 mb-4">
        {t("companiesPage.sectorGraphs.keyInsights")}
      </h3>
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const percentage = formatPercent(
            insight.value / insight.total,
            currentLanguage,
          );

          return (
            <div key={index} className="flex items-start gap-3">
              <div className={`rounded-full p-2 ${insight.bgColor}`}>
                <Icon className={`h-4 w-4 ${insight.iconColor}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-white light:text-black-3">
                  {insight.title}
                </div>
                <div className="text-sm text-grey">
                  {insight.description(percentage)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KeyInsights;
