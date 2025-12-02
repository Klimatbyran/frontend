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
import { Text } from "@/components/ui/text";
import { useLanguage } from "@/components/LanguageProvider";
import { FlipCard } from "./FlipCard";
import { LandingSection } from "./LandingSection";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { enrichCompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import { useScreenSize } from "@/hooks/useScreenSize";
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

export function DidYouKnow() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { companies } = useCompanies();
  const { municipalities } = useMunicipalities();
  const { isMobile } = useScreenSize();

  const stats = useMemo(() => {
    if (!companies.length || !municipalities.length) {
      return [];
    }

    // Enrich companies with KPIs to get meetsParis
    const enrichedCompanies = companies.map(enrichCompanyWithKPIs);

    // Stat #1: Companies with >20% reduction since base year
    const companiesWithSignificantReduction = enrichedCompanies.filter(
      (company) => {
        const changePercent = calculateEmissionsChangeFromBaseYear(company, {
          useLastPeriod: false, // Use latest period with >0 emissions
        });
        return changePercent !== null && changePercent < -20;
      },
    );
    const stat1: StatCard = {
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
    };

    // Stat #2: Companies with increased emissions from base year
    const companiesWithIncreasedEmissions = enrichedCompanies.filter(
      (company) => {
        const changePercent = calculateEmissionsChangeFromBaseYear(company, {
          useLastPeriod: false,
        });
        // Positive change = increase in emissions
        return changePercent !== null && changePercent > 0;
      },
    );
    const stat2: StatCard = {
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
    };

    // Stat #3: Combined Paris alignment (companies + municipalities)
    const companiesMeetingParis = enrichedCompanies.filter(
      (company) => company.meetsParis === true,
    );
    const municipalitiesOnTrack = municipalities.filter(
      (m) => m.meetsParisGoal === true,
    );
    const totalParisAligned =
      companiesMeetingParis.length + municipalitiesOnTrack.length;

    const stat3: StatCard = {
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
    };

    // Stat #4: Companies reporting Scope 3 categories
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
    const stat4: StatCard = {
      icon: Layers,
      teaser: t("landingPage.didYouKnow.stat4.teaser"),
      headline: `${scope3Percentage}%`,
      description: t("landingPage.didYouKnow.stat4.description", {
        percentage: scope3Percentage,
      }),
      bgColor: "bg-blue-4",
      iconBgColor: "bg-blue-3",
      borderColor: "border-blue-3",
    };

    // Stat #5: Municipalities with climate plans
    const municipalitiesWithPlans = municipalities.filter(
      (m) => m.climatePlan === true,
    );
    const plansPercentage = Math.round(
      (municipalitiesWithPlans.length / municipalities.length) * 100,
    );
    const stat5: StatCard = {
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
    };

    // Stat #6: Total emissions tracked (companies + municipalities)
    // Use latest reported value for each entity (may be from different years)
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

    // Convert to million tonnes and format
    const totalEmissionsMt =
      (totalCompanyEmissions + totalMunicipalityEmissions) / 1_000_000;

    const stat6: StatCard = {
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
    };

    return [stat1, stat2, stat3, stat5, stat4, stat6];
  }, [companies, municipalities, t, currentLanguage]);

  if (stats.length === 0) {
    return null;
  }

  return (
    <LandingSection innerClassName="flex flex-col mt-16 md:mt-24 mb-16 md:mb-24">
      <div className="mb-8 md:mb-12">
        <h2 className="text-4xl md:text-5xl font-light text-center mb-2 md:mb-4">
          {t("landingPage.didYouKnow.title")}
        </h2>
        <Text className="text-md text-grey text-center">
          {t("landingPage.didYouKnow.subtitle", {
            action: isMobile
              ? t("landingPage.didYouKnow.actionMobile")
              : t("landingPage.didYouKnow.actionDesktop"),
          })}
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
    </LandingSection>
  );
}
