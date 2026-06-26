import {
  Building2,
  Factory,
  TrendingDown,
  Target,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatPercent,
} from "@/utils/formatting/localization";

interface SectorOverviewStatsProps {
  companyCount: number;
  sectorCount: number;
  totalEmissions: number;
  reducingCount: number;
  reducingPercent: number;
  meetsParisYes: number;
  meetsParisPercent: number;
  selectedYear: string;
}

interface StatCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  subValue?: string;
  progress?: number;
  progressColor?: string;
}

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  subValue,
  progress,
  progressColor = "bg-green-3",
}: StatCardProps) {
  return (
    <div className="bg-black-2 rounded-lg border border-black-1 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-2 ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <span className="text-sm text-grey">{label}</span>
      </div>
      <div>
        <div className="text-2xl font-light text-white">{value}</div>
        {subValue && (
          <div className="text-xs text-grey mt-0.5">{subValue}</div>
        )}
      </div>
      {progress !== undefined && (
        <div className="h-1.5 bg-black-1 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function SectorOverviewStats({
  companyCount,
  sectorCount,
  totalEmissions,
  reducingCount,
  reducingPercent,
  meetsParisYes,
  meetsParisPercent,
  selectedYear,
}: SectorOverviewStatsProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <StatCard
        icon={Building2}
        iconColor="text-blue-3"
        iconBg="bg-blue-5"
        label={t("sectorsOverviewPage.stats.companies")}
        value={companyCount.toString()}
        subValue={t("sectorsOverviewPage.stats.sectorsCount", {
          count: sectorCount,
        })}
      />
      <StatCard
        icon={Factory}
        iconColor="text-orange-3"
        iconBg="bg-orange-5"
        label={t("sectorsOverviewPage.stats.totalEmissions", {
          year: selectedYear,
        })}
        value={`${formatEmissionsAbsolute(Math.round(totalEmissions), currentLanguage)} ${t("emissionsUnit")}`}
      />
      <StatCard
        icon={TrendingDown}
        iconColor="text-green-3"
        iconBg="bg-green-5"
        label={t("sectorsOverviewPage.stats.reducing")}
        value={reducingCount.toString()}
        subValue={formatPercent(reducingPercent, currentLanguage)}
        progress={reducingPercent}
        progressColor="bg-green-3"
      />
      <StatCard
        icon={Target}
        iconColor="text-blue-2"
        iconBg="bg-blue-5"
        label={t("sectorsOverviewPage.stats.parisAligned")}
        value={meetsParisYes.toString()}
        subValue={formatPercent(meetsParisPercent, currentLanguage)}
        progress={meetsParisPercent}
        progressColor="bg-blue-3"
      />
    </div>
  );
}
