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
import { FlipCard } from "./FlipCard";
import { useScreenSize } from "@/hooks/useScreenSize";

interface StatCard {
  icon: LucideIcon;
  teaser: string;
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
  const { isMobile } = useScreenSize();

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
    const percentage = Math.round(
      (companiesWithSignificantReduction.length / companies.length) * 100,
    );
    const stat1: StatCard = {
      icon: Trophy,
      teaser: "Leaders of the Pack",
      headline: `${percentage}%`,
      description: `${percentage}% of companies have reduced emissions by more than 20% since their base year, leading the way in climate action`,
      bgColor: "bg-green-4",
      iconBgColor: "bg-green-3",
      borderColor: "border-green-3",
    };

    // Stat #2: Top-performing sector by average year-over-year emissions reduction
    // Filter out companies with 0 emissions in either period
    // Note: emissionsReduction is calculated as (previous - current) / previous * 100
    // So positive = reduction (good), negative = increase (bad)
    // We want the most positive (best reduction), which is the highest value
    const sectorReductions = new Map<
      string,
      { total: number; count: number }
    >();
    enrichedCompanies.forEach((company) => {
      const sectorCode = company.industry?.industryGics?.sectorCode;
      const latestPeriod = company.reportingPeriods?.[0];
      const previousPeriod = company.reportingPeriods?.[1];
      const currentEmissions =
        latestPeriod?.emissions?.calculatedTotalEmissions ?? 0;
      const previousEmissions =
        previousPeriod?.emissions?.calculatedTotalEmissions ?? 0;

      // Only include companies with valid emissions in both periods (> 0)
      if (
        sectorCode &&
        company.metrics.emissionsReduction !== undefined &&
        currentEmissions > 0 &&
        previousEmissions > 0
      ) {
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
    let topSectorAvg = -Infinity; // Start with -Infinity to find the highest (most positive) reduction
    sectorReductions.forEach((data, sectorCode) => {
      const avg = data.total / data.count;
      // We want the highest average (most positive = best reduction)
      if (avg > topSectorAvg) {
        topSectorAvg = avg;
        topSector = sectorCode;
      }
    });

    // Get sector name (fallback to sector code if translation not available)
    const sectorName = topSector
      ? sectorNames[topSector as keyof typeof sectorNames] ||
        `sector ${topSector}`
      : "technology";

    // Negate for display: emissionsReduction is positive for reductions, but we want to show as negative (standard convention)
    const displayReduction = -topSectorAvg;

    const stat2: StatCard = {
      icon: Building2,
      teaser: sectorName,
      headline: `${formatPercentChange(displayReduction, currentLanguage)}`,
      description: `The ${sectorName} sector has the highest average emissions reduction rate at ${formatPercentChange(displayReduction, currentLanguage)}, showing strong recent progress in climate action`,
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
      teaser: "Paris Aligned",
      headline: `${companiesMeetingParis.length}`,
      description: `${companiesMeetingParis.length} companies are on track to meet Paris Agreement goals, demonstrating alignment with 1.5°C pathways`,
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
    const scope3Percentage = Math.round(
      (companiesWithScope3Categories.length / companies.length) * 100,
    );
    const stat5: StatCard = {
      icon: Layers,
      teaser: "Transparent Reporting",
      headline: `${scope3Percentage}%`,
      description: `${scope3Percentage}% of companies report comprehensive Scope 3 emissions by category, providing transparency into their value chain`,
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
      teaser: "On Track",
      headline: `${municipalitiesOnTrack.length}`,
      description: `${municipalitiesOnTrack.length} municipalities have achieved carbon neutrality or are on track to meet their 2030 climate targets`,
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

    const avgPerCapitaFormatted = formatEmissionsAbsolute(
      avgPerCapita,
      currentLanguage,
    );
    const stat8: StatCard = {
      icon: Zap,
      teaser: "Per Capita",
      headline: avgPerCapitaFormatted,
      description: `${avgPerCapitaFormatted}/capita is the average municipal emissions per resident, with ${lowestPerCapita?.name || "Stockholm"} leading at just ${lowestPerCapita ? formatEmissionsAbsolute(lowestPerCapita.totalConsumptionEmission, currentLanguage) : "1.3 tCO₂e"}/capita`,
      bgColor: "bg-green-4",
      iconBgColor: "bg-green-3",
      borderColor: "border-green-3",
    };

    // Stat #9: Municipalities with climate plans
    const municipalitiesWithPlans = municipalities.filter(
      (m) => m.climatePlan === true,
    );
    const plansPercentage = Math.round(
      (municipalitiesWithPlans.length / municipalities.length) * 100,
    );
    const stat9: StatCard = {
      icon: FileText,
      teaser: "With Plans",
      headline: `${plansPercentage}%`,
      description: `${plansPercentage}% of municipalities have adopted climate plans, committing to structured emissions reduction strategies`,
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
      teaser: "Total Tracked",
      headline: `${totalEmissionsMt.toFixed(0)}M`,
      description: `${totalEmissionsMt.toFixed(0)} million tonnes of CO₂e tracked across ${companies.length} companies and ${municipalities.length} municipalities in our database`,
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
          Interesting insights from Sweden's climate data -{" "}
          {isMobile ? "click to explore" : "hover to explore"}!
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mx-2 sm:mx-8">
        {stats.map((stat, index) => (
          <FlipCard
            key={index}
            icon={stat.icon}
            teaser={stat.teaser}
            headline={stat.headline}
            description={stat.description}
            iconBgColor={stat.iconBgColor}
            borderColor={stat.borderColor}
          />
        ))}
      </div>
    </div>
  );
}
