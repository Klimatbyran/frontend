import { useMemo } from "react";
import {
  Trophy,
  Building2,
  Target,
  Layers,
  MapPin,
  FileText,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { enrichCompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { Text } from "@/components/ui/text";

interface StatCard {
  icon: LucideIcon;
  headline: string;
  description: string;
  bgColor: string;
  iconBgColor: string;
  borderColor: string;
}

export function DidYouKnow() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { companies } = useCompanies();
  const { municipalities } = useMunicipalities();
  const sectorNames = useSectorNames();

  const stats = useMemo(() => {
    if (!companies.length || !municipalities.length) {
      return [];
    }

    // Enrich companies with KPIs to get meetsParis
    const enrichedCompanies = companies.map(enrichCompanyWithKPIs);

    // Stat #1: Companies with >20% reduction since base year
    const companiesWithSignificantReduction = enrichedCompanies.filter(
      (company) => company.metrics.emissionsReduction > 20,
    );
    const stat1: StatCard = {
      icon: Trophy,
      headline: `${Math.round((companiesWithSignificantReduction.length / companies.length) * 100)}% of companies`,
      description: `have reduced emissions by more than 20% since their base year, leading the way in climate action`,
      bgColor: "bg-green-4",
      iconBgColor: "bg-green-3",
      borderColor: "border-green-3",
    };

    // Stat #2: Top-performing sector by average emissions reduction
    const sectorReductions = new Map<
      string,
      { total: number; count: number }
    >();
    enrichedCompanies.forEach((company) => {
      const sectorCode = company.industry?.industryGics?.sectorCode;
      if (sectorCode && company.metrics.emissionsReduction !== undefined) {
        const existing = sectorReductions.get(sectorCode) || {
          total: 0,
          count: 0,
        };
        sectorReductions.set(sectorCode, {
          total: existing.total + company.metrics.emissionsReduction,
          count: existing.count + 1,
        });
      }
    });

    let topSector = "";
    let topSectorAvg = 0;
    let topSectorCount = 0;
    sectorReductions.forEach((data, sectorCode) => {
      const avg = data.total / data.count;
      if (avg > topSectorAvg) {
        topSectorAvg = avg;
        topSector = sectorCode;
        topSectorCount = data.count;
      }
    });

    // Get sector name (fallback to sector code if translation not available)
    const sectorName = topSector
      ? sectorNames[topSector] || `sector ${topSector}`
      : "technology";

    const stat2: StatCard = {
      icon: Building2,
      headline: `${topSectorCount} companies`,
      description: `in the ${sectorName} sector show the highest average emissions reduction rates across all industries`,
      bgColor: "bg-blue-4",
      iconBgColor: "bg-blue-3",
      borderColor: "border-blue-3",
    };

    // Stat #4: Companies meeting Paris alignment
    const companiesMeetingParis = enrichedCompanies.filter(
      (company) => company.meetsParis === true,
    );
    const stat4: StatCard = {
      icon: Target,
      headline: `${companiesMeetingParis.length} companies`,
      description: `are on track to meet Paris Agreement goals, demonstrating alignment with 1.5°C pathways`,
      bgColor: "bg-orange-4",
      iconBgColor: "bg-orange-3",
      borderColor: "border-orange-3",
    };

    // Stat #5: Companies reporting Scope 3 categories
    const companiesWithScope3Categories = companies.filter((company) => {
      const latestPeriod = company.reportingPeriods?.[0];
      const scope3Categories =
        latestPeriod?.emissions?.scope3?.categories || [];
      // Check if they have at least one category with actual data (not just total)
      return (
        scope3Categories.length > 0 &&
        scope3Categories.some(
          (cat) =>
            cat.total !== null && cat.total !== undefined && cat.total > 0,
        )
      );
    });
    const stat5: StatCard = {
      icon: Layers,
      headline: `${Math.round((companiesWithScope3Categories.length / companies.length) * 100)}% of companies`,
      description: `report comprehensive Scope 3 emissions by category, providing transparency into their value chain`,
      bgColor: "bg-pink-4",
      iconBgColor: "bg-pink-3",
      borderColor: "border-pink-3",
    };

    // Stat #7: Municipalities on track (meetsParisGoal)
    const municipalitiesOnTrack = municipalities.filter(
      (m) => m.meetsParisGoal === true,
    );
    const stat7: StatCard = {
      icon: MapPin,
      headline: `${municipalitiesOnTrack.length} municipalities`,
      description: `have achieved carbon neutrality or are on track to meet their 2030 climate targets`,
      bgColor: "bg-orange-4",
      iconBgColor: "bg-orange-3",
      borderColor: "border-orange-3",
    };

    // Stat #8: Average municipal emissions per capita
    const municipalitiesWithData = municipalities.filter(
      (m) => m.totalConsumptionEmission > 0,
    );
    const avgPerCapita =
      municipalitiesWithData.length > 0
        ? municipalitiesWithData.reduce(
            (sum, m) => sum + m.totalConsumptionEmission,
            0,
          ) / municipalitiesWithData.length
        : 0;

    // Find municipality with lowest per capita
    const lowestPerCapita =
      municipalitiesWithData.length > 0
        ? municipalitiesWithData.reduce(
            (min, m) =>
              m.totalConsumptionEmission < min.totalConsumptionEmission
                ? m
                : min,
            municipalitiesWithData[0],
          )
        : null;

    const stat8: StatCard = {
      icon: Zap,
      headline: `${formatEmissionsAbsolute(avgPerCapita, currentLanguage)}/capita`,
      description: `is the average municipal emissions per resident, with ${lowestPerCapita?.name || "Stockholm"} leading at just ${lowestPerCapita ? formatEmissionsAbsolute(lowestPerCapita.totalConsumptionEmission, currentLanguage) : "1.3 tCO₂e"}/capita`,
      bgColor: "bg-green-4",
      iconBgColor: "bg-green-3",
      borderColor: "border-green-3",
    };

    // Stat #9: Municipalities with climate plans
    const municipalitiesWithPlans = municipalities.filter(
      (m) => m.climatePlan === true,
    );
    const stat9: StatCard = {
      icon: FileText,
      headline: `${Math.round((municipalitiesWithPlans.length / municipalities.length) * 100)}% of municipalities`,
      description: `have adopted climate plans, committing to structured emissions reduction strategies`,
      bgColor: "bg-blue-4",
      iconBgColor: "bg-blue-3",
      borderColor: "border-blue-3",
    };

    // Stat #11: Total emissions tracked (company emissions only, as municipality emissions are per capita)
    const totalCompanyEmissions = companies.reduce(
      (sum, company) =>
        sum +
        (company.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0),
      0,
    );
    // Convert to million tonnes and format
    const totalEmissionsMt = totalCompanyEmissions / 1_000_000;

    const stat11: StatCard = {
      icon: Building2,
      headline: `${totalEmissionsMt.toFixed(0)} million tonnes`,
      description: `of CO₂e tracked across ${companies.length} companies and ${municipalities.length} municipalities in our database`,
      bgColor: "bg-pink-4",
      iconBgColor: "bg-pink-3",
      borderColor: "border-pink-3",
    };

    return [stat1, stat2, stat4, stat5, stat7, stat8, stat9, stat11];
  }, [companies, municipalities, t, currentLanguage, sectorNames]);

  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col w-full mt-16 md:mt-24 mb-16 md:mb-24">
      <div className="mb-8 md:mb-12">
        <h2 className="text-4xl md:text-5xl font-light text-center mb-2 md:mb-4">
          Did You Know?
        </h2>
        <Text className="text-md text-grey text-center">
          Fascinating insights from Sweden's climate data
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mx-2 sm:mx-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`flex flex-col bg-black-2 rounded-level-2 p-4 md:p-6 min-h-[180px] md:min-h-[200px] border-2 ${stat.borderColor}`}
            >
              <div
                className={`${stat.iconBgColor} w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4 flex-shrink-0`}
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6 text-black" />
              </div>
              <h3 className="text-xl md:text-2xl font-light tracking-tight mb-2 md:mb-3">
                {stat.headline}
              </h3>
              <Text className="text-sm md:text-base text-grey leading-relaxed">
                {stat.description}
              </Text>
            </div>
          );
        })}
      </div>
    </div>
  );
}
