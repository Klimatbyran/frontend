import { Text } from "@/components/ui/text";
import { Accordion } from "@/components/ui/accordion";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useBoardMembers } from "@/hooks/useBoardMembers";
import { AccordionGroup } from "../components/layout/AccordionGroup";
import { LinkButton } from "@/components/layout/LinkButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTranslation } from "react-i18next";
import { MembersGrid } from "@/components/MembersGrid";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useEffect } from "react";
import KlimatkollenVideo from "@/components/ui/klimatkollenVideoPlayer";

export function AboutPage() {
  const { t } = useTranslation();
  const teamMembers = useTeamMembers();
  const boardMembers = useBoardMembers();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prepare SEO data
  const canonicalUrl = "https://klimatkollen.se/about";
  const pageTitle = `${t("aboutPage.header.title")} - Klimatkollen`;
  const pageDescription = t("aboutPage.header.description");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Klimatkollen",
    url: "https://klimatkollen.se",
    logo: "https://klimatkollen.se/images/social-picture.png",
    description: pageDescription,
  };

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
      <div className="max-w-[1200px] mx-auto">
        <PageHeader
          title={t("aboutPage.header.title")}
          description={t("aboutPage.header.description")}
        />
        <Accordion type="single" collapsible className="space-y-6">
          {/* Main Content */}
          <div className="bg-black-2 rounded-level-1 p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-start justify-between">
              <div className="space-y-4 w-full">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-4">
                  <Text
                    variant="h3"
                    className="text-4xl md:text-3xl sm:text-2xl"
                  >
                    {t("aboutPage.mainContent.title")}
                  </Text>
                </div>
                <KlimatkollenVideo />

                <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-4">
                  <div className="prose prose-invert w-full max-w-5xl space-y-4">
                    <p>{t("aboutPage.mainContent.paragraph1")}</p>
                    <p>{t("aboutPage.mainContent.paragraph2")}</p>
                  </div>
                </div>

                <div className="prose prose-invert w-full max-w-6xl space-y-4">
                  <p>{t("aboutPage.mainContent.paragraph3")}</p>

                  <p>{t("aboutPage.mainContent.paragraph4")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Approach Section */}
          <AccordionGroup
            title={t("aboutPage.ourApproachSection.title")}
            value="financingSection"
          >
            <div className="prose prose-invert w-[90%] max-w-5xl mx-auto space-y-4">
              <p>{t("aboutPage.ourApproachSection.paragraph1")}</p>
              <p>{t("aboutPage.ourApproachSection.paragraph2")}</p>
              <p>{t("aboutPage.ourApproachSection.paragraph3")}</p>
              <p>{t("aboutPage.ourApproachSection.paragraph4")}</p>
              <p>{t("aboutPage.ourApproachSection.paragraph5")}</p>
              <p>{t("aboutPage.ourApproachSection.paragraph6")}</p>
              <p>{t("aboutPage.ourApproachSection.paragraph7")}</p>
            </div>
          </AccordionGroup>

          {/* Team Section */}
          <AccordionGroup
            title={t("aboutPage.teamSection.title")}
            value="teamSection"
          >
            <MembersGrid members={teamMembers} />
          </AccordionGroup>

          {/* Board Section */}
          <AccordionGroup
            title={t("aboutPage.boardSection.title")}
            value="boardSection"
          >
            <MembersGrid members={boardMembers} />
            <div className="p-8 prose prose-invert">
              <p>
                {t("aboutPage.boardSection.links.stadgar")}{" "}
                <a
                  href="/documents/stadgar.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  {t("aboutPage.boardSection.links.stadgarLink")}
                </a>
                {", "}{" "}
                <a
                  href="/documents/uppforandekod.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  {t("aboutPage.boardSection.links.uppforandekodLink")}
                </a>{" "}
                {t("aboutPage.boardSection.links.and")}{" "}
                <a
                  href="/documents/antikorruptionspolicy.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  {t("aboutPage.boardSection.links.antikorruptionspolicyLink")}
                </a>{" "}
                .
              </p>
            </div>
          </AccordionGroup>

          {/* Financing Section */}
          <AccordionGroup
            title={t("aboutPage.financingSection.title")}
            value="financingSection"
          >
            <div className="prose prose-invert w-[90%] max-w-5xl mx-auto space-y-4">
              <p>{t("aboutPage.financingSection.paragraph1")}</p>
              <p>{t("aboutPage.financingSection.paragraph2")}</p>
              <p>{t("aboutPage.financingSection.paragraph3")}</p>
              <div className="bg-blue-5/30 rounded-level-2 p-6 mt-8 max-w-3xl">
                <Text variant="body">
                  {t("aboutPage.financingSection.donate")}
                </Text>
                <Text className="text-grey">
                  {t("aboutPage.financingSection.donateDescription")}
                </Text>
                <Text variant="body" className="text-blue-2 mt-2">
                  {t("aboutPage.financingSection.bankgiro")}
                </Text>

                <Text variant="body" className="text-blue-2 mt-2">
                  {t("aboutPage.financingSection.swish")}
                </Text>
              </div>
            </div>
          </AccordionGroup>

          {/* Previous Projects Section */}
          <AccordionGroup
            title={t("aboutPage.previousProjectsSection.title")}
            value="previousProjects"
          >
            <div className="prose prose-invert w-[90%] max-w-5xl mx-auto space-y-8">
              <div className="space-y-4">
                <Text className="text-blue-2 font-bold text-2xl">
                  {t("aboutPage.previousProjectsSection.kommunprojektetTitle")}
                </Text>
                <Text variant="body">
                  {t(
                    "aboutPage.previousProjectsSection.kommunprojektetDescription",
                  )}
                </Text>
              </div>

              <div className="space-y-4">
                <Text className="text-blue-2 font-bold text-2xl">
                  {t("aboutPage.previousProjectsSection.riksdagsvaletTitle")}
                </Text>
                <Text variant="body">
                  {t(
                    "aboutPage.previousProjectsSection.riksdagsvaletDescription",
                  )}
                </Text>
                <div className="space-y-6 max-w-3xl">
                  <LinkButton
                    title={t(
                      "aboutPage.previousProjectsSection.klimatmalTitle",
                    )}
                    text={t("aboutPage.previousProjectsSection.klimatmalText")}
                    link="/insights/klimatmal"
                  />
                  <LinkButton
                    title={t(
                      "aboutPage.previousProjectsSection.utslappsberakningTitle",
                    )}
                    text={t(
                      "aboutPage.previousProjectsSection.utslappsberakningText",
                    )}
                    link="/insights/utslappsberakning"
                  />
                </div>
              </div>
            </div>
          </AccordionGroup>
        </Accordion>
      </div>
    </>
  );
}
