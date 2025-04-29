import {
  ArrowDown,
  LineChart,
  Building2,
  Users,
  Globe2,
  AlertCircle,
  FileSpreadsheet,
  Scale,
  Target,
  History,
  ArrowRight,
} from "lucide-react";
import ParticleAnimation from "../components/learnMore/ParticleAnimation";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import { SectionCard } from "@/components/learnMore/SectionCard";
import { FeatureCard } from "@/components/learnMore/FeatureCard";
import { SectionHeader } from "@/components/learnMore/SectionHeader";

export function LearnMoreReporting() {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();

  // Define lists of items for reuse
  const challengeItems = [
    t("learnMorePage.currentChallengesDescription1"),
    t("learnMorePage.currentChallengesDescription2"),
    t("learnMorePage.currentChallengesDescription3"),
    t("learnMorePage.currentChallengesDescription4"),
  ];

  const improvementItems = [
    t("learnMorePage.csrdImprovementsDescription1"),
    t("learnMorePage.csrdImprovementsDescription2"),
    t("learnMorePage.csrdImprovementsDescription3"),
    t("learnMorePage.csrdImprovementsDescription4"),
  ];

  const parisAlignmentItems = [
    t("learnMorePage.parisAlignmentDescription1"),
    t("learnMorePage.parisAlignmentDescription2"),
    t("learnMorePage.parisAlignmentDescription3"),
  ];

  // Use the implementation steps directly from translation
  const implementationSteps = t("learnMorePage.implementationSteps", {
    returnObjects: true,
  }) as string[];

  // Define feature cards data
  const featureCards = [
    {
      icon: <Building2 className="w-12 h-12 text-blue-3 mb-4 drop-shadow" />,
      title: t("learnMorePage.companies"),
      description: t("learnMorePage.companiesDescription"),
    },
    {
      icon: <Users className="w-12 h-12 text-blue-3 mb-4 drop-shadow" />,
      title: t("learnMorePage.communities"),
      description: t("learnMorePage.communitiesDescription"),
    },
    {
      icon: <Globe2 className="w-12 h-12 text-blue-3 mb-4 drop-shadow" />,
      title: t("learnMorePage.countries"),
      description: t("learnMorePage.countriesDescription"),
    },
    {
      icon: <AlertCircle className="w-12 h-12 text-blue-3 mb-4 drop-shadow" />,
      title: t("learnMorePage.dataGaps"),
      description: t("learnMorePage.dataGapsDescription"),
    },
  ];

  return (
    <div className="bg-black text-white pb-20">
      <ParticleAnimation />
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            {t("learnMorePage.title")}
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 text-gray-300">
            {t("learnMorePage.subtitle")}
          </p>
          <div className="animate-bounce mt-12">
            <ArrowDown size={32} className="text-white opacity-75" />
          </div>
        </div>

        {/* Info Section */}
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-xl border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white drop-shadow-lg">
              {t("learnMorePage.impactTitle")}
            </h2>
            <p className="text-lg md:text-xl text-gray-200 mb-6 drop-shadow">
              {t("learnMorePage.impactDescription")}
            </p>
            <p className="text-lg md:text-xl text-gray-200 drop-shadow">
              {t("learnMorePage.impactDescription2")}
            </p>
          </div>
        </div>

        {/* Tracking Section */}
        <div className="min-h-screen flex items-center justify-center px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title={t("learnMorePage.trackingTitle")}
              description={t("learnMorePage.trackingDescription")}
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featureCards.map((card, index) => (
                <FeatureCard
                  key={index}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                />
              ))}
            </div>

            <div className="mt-16 bg-black/40 backdrop-blur-xl rounded-xl p-8 border border-white/10 shadow-xl">
              <div
                className={
                  isMobile ? "flex flex-col" : "flex items-start gap-6"
                }
              >
                {isMobile ? (
                  <div className="mb-4">
                    <LineChart className="w-8 h-8 text-blue-3 flex-shrink-0 drop-shadow mb-2" />
                    <h3 className="text-2xl font-semibold text-white drop-shadow-lg">
                      {t("learnMorePage.whyTrackingMatters")}
                    </h3>
                  </div>
                ) : (
                  <LineChart className="w-12 h-12 text-blue-3 flex-shrink-0 mt-1 drop-shadow" />
                )}

                <div className={isMobile ? "w-full" : ""}>
                  {!isMobile && (
                    <h3 className="text-2xl font-semibold mb-4 text-white drop-shadow-lg">
                      {t("learnMorePage.whyTrackingMatters")}
                    </h3>
                  )}
                  <p className="text-gray-200 mb-4 drop-shadow">
                    {t("learnMorePage.whyTrackingMattersDescription")}
                  </p>
                  <ul className="list-disc list-inside text-gray-200 space-y-2 drop-shadow">
                    {(
                      t("learnMorePage.trackingBenefits", {
                        returnObjects: true,
                      }) as string[]
                    ).map((benefit: string, index: number) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSRD Section */}
        <div className="min-h-screen flex items-center justify-center px-4 py-16 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title={t("learnMorePage.csrdTitle")}
              description={t("learnMorePage.csrdDescription")}
            />

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <SectionCard
                icon={
                  <History className="w-12 h-12 text-blue-3 mb-6 drop-shadow" />
                }
                title={t("learnMorePage.currentChallenges")}
                items={challengeItems}
              />

              <SectionCard
                icon={
                  <FileSpreadsheet className="w-12 h-12 text-blue-3 mb-6 drop-shadow" />
                }
                title={t("learnMorePage.csrdImprovements")}
                items={improvementItems}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <SectionCard
                icon={
                  <Target className="w-12 h-12 text-blue-3 mb-6 drop-shadow" />
                }
                title={t("learnMorePage.parisAlignment")}
                description={t("learnMorePage.parisAlignmentDescription")}
                items={parisAlignmentItems}
              />

              <SectionCard
                icon={
                  <Scale className="w-12 h-12 text-blue-3 mb-6 drop-shadow" />
                }
                title={t("learnMorePage.implementationTimeline")}
                items={implementationSteps}
              />
            </div>
          </div>
        </div>

        <div className="py-16 flex flex-col items-center justify-center px-4 text-center">
          {/* separated into separate PRs, so this is commented out for now */}
          {/* <div className="animate-bounce mt-12">
            <p>Continue</p><ArrowRight size={32} className="text-white opacity-75" />
          </div> */}
        </div>
      </div>
    </div>
  );
}
