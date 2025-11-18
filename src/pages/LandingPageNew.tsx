// TODO: This is currently a slightly modified copy of the live landing page, all landing page modifications can be made here
// without worry of impacting prod until we're ready
import {
  Building2Icon,
  TreePineIcon,
  Users,
  BarChart3,
  TrendingUp,
  Target,
  Eye,
  Compass,
} from "lucide-react";
import { TopList, TopListItem } from "@/components/TopList";

import { Typewriter } from "@/components/ui/typewriter";
import { ScrollAnimationSection } from "@/components/ui/ScrollAnimationSection";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";

export function LandingPageNew() {
  const { t } = useTranslation();
  const { companies } = useCompanies();
  const { getTopMunicipalities } = useMunicipalities();
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prepare SEO data
  const canonicalUrl = "https://klimatkollen.se";
  const pageTitle = `Klimatkollen - ${t("landingPage.metaTitle")}`;
  const pageDescription = t("landingPage.metaDescription");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Klimatkollen",
    url: canonicalUrl,
    logo: "https://klimatkollen.se/images/social-picture.png",
    description: pageDescription,
  };

  const TypeWriterTexts = [
    t("landingPage.typewriter.reduceEmissions"),
    t("landingPage.typewriter.scope3Emissions"),
    t("landingPage.typewriter.meetParisAgreement"),
    t("landingPage.typewriter.climateActions"),
    t("landingPage.typewriter.climatePlans"),
  ];

  // Get top 5 companies by total emissions
  const largestCompanyEmitters = companies
    .sort(
      (a, b) =>
        (b.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0) -
        (a.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0),
    )
    .slice(0, 5)
    .map((company) => ({
      name: company.name,
      value:
        company.reportingPeriods.at(0)?.emissions?.calculatedTotalEmissions ||
        0,
      link: `/companies/${company.wikidataId}`,
    }));

  // Get top 5 municipalities by emissions reduction
  const topMunicipalities = getTopMunicipalities(5).map((municipality) => ({
    name: municipality.name,
    value: municipality.historicalEmissionChangePercent,
    link: `/municipalities/${municipality.name}`,
  }));

  const renderCompanyEmission = (item: TopListItem) => (
    <div className="text-base sm:text-lg">
      <span className="md:text-right text-pink-3">
        {formatEmissionsAbsolute(item.value, currentLanguage)}
      </span>
      <span className="text-grey ml-2"> {t("emissionsUnit")}</span>
    </div>
  );

  const renderMunicipalityChangeRate = (item: TopListItem) => (
    <span className="text-base sm:text-lg md:text-right text-green-3">
      {formatPercentChange(item.value, currentLanguage)}
    </span>
  );

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
      <div className="flex flex-col">
        <div className="flex-1 flex flex-col items-center text-center px-4 py-14 md:py-24">
          <div className="max-w-lg md:max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-7xl font-light tracking-tight">
              {t("landingPage.title")}
            </h1>

            <div className="h-[80px] md:h-[120px] flex items-center justify-center text-4xl md:text-7xl font-light">
              <Typewriter
                text={TypeWriterTexts}
                speed={70}
                className="text-[#E2FF8D]"
                waitTime={2000}
                deleteSpeed={40}
                cursorChar="_"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Animation Section */}
      <ScrollAnimationSection
        steps={[
          {
            id: "mission",
            content: (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 border border-blue-500/30">
                    <Target className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      Transparency for Climate Action
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
                    Our Mission
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                    Klimatkollen exists to make climate data accessible to
                    everyone. We believe that transparency drives
                    accountability, and accountability drives real climate
                    action. By putting emissions data in the hands of citizens,
                    we empower communities to hold organizations accountable for
                    their environmental commitments.
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    {/* Image placeholder - will be replaced with actual imagery */}
                    <Target className="w-32 h-32 text-white/20" />
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "transparency",
            content: (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-6 order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-600 to-green-800 border border-green-500/30">
                    <Eye className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      Sunlight is the Best Disinfectant
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
                    Why Data
                    <br />
                    Transparency Matters
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                    When emissions data is hidden behind corporate reports and
                    government databases, progress stagnates. Transparent,
                    accessible climate data creates market pressure for better
                    performance. Companies and municipalities that know their
                    data is public work harder to improve their rankings and
                    meet their climate commitments.
                  </p>
                </div>
                <div className="flex items-center justify-center order-1 lg:order-2">
                  <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                    {/* Image placeholder - will be replaced with actual imagery */}
                    <Eye className="w-32 h-32 text-white/20" />
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "methodology",
            content: (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-600 to-green-600 border border-teal-500/30">
                    <BarChart3 className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      Science-Based Rankings
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
                    Our Methodology
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                    We use verified emissions data from official reporting
                    sources to create fair, comparable rankings. Our metrics
                    focus on actual emissions reductions, not just promises or
                    targets. Every ranking is based on real performance data,
                    ensuring that climate leaders are recognized and climate
                    laggards are held accountable.
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-teal-600 to-green-600 flex items-center justify-center">
                    {/* Image placeholder - will be replaced with actual imagery */}
                    <BarChart3 className="w-32 h-32 text-white/20" />
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "impact",
            content: (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-6 order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 border border-gray-500/30">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      From Data to Action
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
                    Driving Real Impact
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                    Our platform has already helped identify climate leaders and
                    laggards across Sweden. By ranking organizations on their
                    actual emissions performance, we create healthy competition
                    that accelerates climate progress. The data doesn't lie—and
                    neither should climate commitments.
                  </p>
                </div>
                <div className="flex items-center justify-center order-1 lg:order-2">
                  <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                    {/* Image placeholder - will be replaced with actual imagery */}
                    <TrendingUp className="w-32 h-32 text-white/20" />
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "engagement",
            content: (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-600 to-orange-800 border border-orange-500/30">
                    <Users className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      Every Voice Counts
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
                    Citizen Action &
                    <br />
                    Engagement
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                    Climate action isn't just for governments and
                    corporations—it starts with informed citizens. When you can
                    see how your local municipality or favorite company performs
                    on climate metrics, you can make better choices as a
                    consumer, voter, and community member. Your engagement
                    drives the demand for better climate performance.
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center">
                    {/* Image placeholder - will be replaced with actual imagery */}
                    <Users className="w-32 h-32 text-white/20" />
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "path-forward",
            content: (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-6 order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-600 to-blue-600 border border-green-500/30">
                    <Compass className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      Building a Climate-Conscious Society
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
                    The Path Forward
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                    Imagine a world where every organization's climate
                    performance is as visible as their financial results. Where
                    citizens can easily compare the environmental impact of
                    their choices. Where transparency drives a race to the top
                    in climate action. That's the future we're building, one
                    data point at a time.
                  </p>
                </div>
                <div className="flex items-center justify-center order-1 lg:order-2">
                  <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
                    {/* Image placeholder - will be replaced with actual imagery */}
                    <Compass className="w-32 h-32 text-white/20" />
                  </div>
                </div>
              </div>
            ),
          },
        ]}
        className="bg-black"
      />

      <div className="py-8 pt-36 md:py-36">
        <div className="mx-2 sm:mx-8">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-8 md:mb-16">
            {t("landingPage.bestPerformers")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopList
              title={t("landingPage.bestMunicipalities")}
              description={t("landingPage.municipalitiesDescription")}
              items={topMunicipalities}
              itemValueRenderer={renderMunicipalityChangeRate}
              icon={{ component: TreePineIcon, bgColor: "bg-[#FDE7CE]" }}
              rankColor="text-orange-2"
              headingLink={`${currentLanguage}/municipalities`}
            />

            <TopList
              title={t("landingPage.largestEmittor")}
              description={t("landingPage.companiesDescription")}
              items={largestCompanyEmitters}
              itemValueRenderer={renderCompanyEmission}
              icon={{ component: Building2Icon, bgColor: "bg-[#D4E7F7]" }}
              rankColor="text-blue-2"
              headingLink={`${currentLanguage}/companies`}
            />
          </div>
        </div>
      </div>
    </>
  );
}
