import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Trophy,
  Building2,
  Target,
  Layers,
  FileText,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { enrichCompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import { calculateEmissionsChangeFromBaseYear } from "@/utils/calculations/emissionsCalculations";

interface StatCard {
  icon: LucideIcon;
  teaser: string;
  headline: string;
  description: string;
  bgColor: string;
  iconBgColor: string;
  borderColor: string;
}

const REDUCTION_THRESHOLD = -20;
const MILLION_DIVISOR = 1_000_000;

export function useDidYouKnowStats() {
  const { t } = useTranslation();
  const { companies } = useCompanies();
  const { municipalities } = useMunicipalities();

  const stats = useMemo(() => {
    if (!companies.length || !municipalities.length) {
      return [];
    }

    const enrichedCompanies = companies.map(enrichCompanyWithKPIs);

    // Stat #1: Companies with >20% reduction since base year
    const companiesWithSignificantReduction = enrichedCompanies.filter(
      (company) => {
        const changePercent = calculateEmissionsChangeFromBaseYear(company, {
          useLastPeriod: false,
        });
        return changePercent !== null && changePercent < REDUCTION_THRESHOLD;
      },
    );

    // Stat #2: Companies with increased emissions from base year
    const companiesWithIncreasedEmissions = enrichedCompanies.filter(
      (company) => {
        const changePercent = calculateEmissionsChangeFromBaseYear(company, {
          useLastPeriod: false,
        });
        return changePercent !== null && changePercent > 0;
      },
    );

    // Stat #3: Combined Paris alignment (companies + municipalities)
    const companiesMeetingParis = enrichedCompanies.filter(
      (company) => company.meetsParis === true,
    );
    const municipalitiesOnTrack = municipalities.filter(
      (m) => m.meetsParisGoal === true,
    );
    const totalParisAligned =
      companiesMeetingParis.length + municipalitiesOnTrack.length;

    // Stat #4: Companies reporting Scope 3 categories
    const companiesWithScope3Categories = companies.filter((company) => {
      const latestPeriod = company.reportingPeriods?.[0];
      const scope3Categories =
        latestPeriod?.emissions?.scope3?.categories || [];
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

    // Stat #5: Municipalities with climate plans
    const municipalitiesWithPlans = municipalities.filter(
      (m) => m.climatePlan === true,
    );
    const plansPercentage = Math.round(
      (municipalitiesWithPlans.length / municipalities.length) * 100,
    );

    // Stat #6: Total emissions tracked (companies + municipalities)
    const totalCompanyEmissions = companies.reduce((sum, company) => {
      const sortedPeriods = [...(company.reportingPeriods || [])].sort(
        (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
      );
      const latestPeriod = sortedPeriods[0];
      return sum + (latestPeriod?.emissions?.calculatedTotalEmissions || 0);
    }, 0);

    const totalMunicipalityEmissions = municipalities.reduce(
      (sum, municipality) => {
        const latestEmissions = municipality.emissions.at(-1);
        return sum + (latestEmissions?.value || 0);
      },
      0,
    );

    const totalEmissionsMt =
      (totalCompanyEmissions + totalMunicipalityEmissions) / MILLION_DIVISOR;

    // Build stat cards
    const statCards: StatCard[] = [
      {
        icon: Trophy,
        teaser: t("landingPage.didYouKnow.stat1.teaser"),
        headline: `${companiesWithSignificantReduction.length}`,
        description: t("landingPage.didYouKnow.stat1.description", {
          count: companiesWithSignificantReduction.length,
          total: companies.length,
        }),
        bgColor: "bg-green-4",
        iconBgColor: "bg-green-3",
        borderColor: "border-green-3",
      },
      {
        icon: TrendingUp,
        teaser: t("landingPage.didYouKnow.stat2.teaser"),
        headline: `${companiesWithIncreasedEmissions.length}`,
        description: t("landingPage.didYouKnow.stat2.description", {
          count: companiesWithIncreasedEmissions.length,
          total: companies.length,
        }),
        bgColor: "bg-pink-4",
        iconBgColor: "bg-pink-3",
        borderColor: "border-pink-3",
      },
      {
        icon: Target,
        teaser: t("landingPage.didYouKnow.stat3.teaser"),
        headline: `${totalParisAligned}`,
        description: t("landingPage.didYouKnow.stat3.description", {
          companyCount: companiesMeetingParis.length,
          companyTotal: companies.length,
          municipalityCount: municipalitiesOnTrack.length,
          municipalityTotal: municipalities.length,
        }),
        bgColor: "bg-orange-4",
        iconBgColor: "bg-orange-3",
        borderColor: "border-orange-3",
      },
      {
        icon: FileText,
        teaser: t("landingPage.didYouKnow.stat5.teaser"),
        headline: `${plansPercentage}%`,
        description: t("landingPage.didYouKnow.stat5.description", {
          percentage: plansPercentage,
          count: municipalitiesWithPlans.length,
          total: municipalities.length,
        }),
        bgColor: "bg-orange-4",
        iconBgColor: "bg-orange-3",
        borderColor: "border-orange-3",
      },
      {
        icon: Layers,
        teaser: t("landingPage.didYouKnow.stat4.teaser"),
        headline: `${scope3Percentage}%`,
        description: t("landingPage.didYouKnow.stat4.description", {
          percentage: scope3Percentage,
        }),
        bgColor: "bg-blue-4",
        iconBgColor: "bg-blue-3",
        borderColor: "border-blue-3",
      },
      {
        icon: Building2,
        teaser: t("landingPage.didYouKnow.stat6.teaser"),
        headline: `${totalEmissionsMt.toFixed(0)}M`,
        description: t("landingPage.didYouKnow.stat6.description", {
          total: totalEmissionsMt.toFixed(0),
          companyCount: companies.length,
          municipalityCount: municipalities.length,
        }),
        bgColor: "bg-pink-4",
        iconBgColor: "bg-pink-3",
        borderColor: "border-pink-3",
      },
    ];

    return statCards;
  }, [companies, municipalities, t]);

  return stats;
}
