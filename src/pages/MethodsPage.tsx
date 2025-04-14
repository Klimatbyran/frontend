import { Accordion } from "@/components/ui/accordion";
import { AccordionGroup } from "../components/layout/AccordionGroup";
import { LinkButton } from "@/components/layout/LinkButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Trans, useTranslation } from "react-i18next";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useEffect } from "react";

export function MethodsPage() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prepare SEO data
  const canonicalUrl = "https://klimatkollen.se/methodology";
  const pageTitle = `${t("methodsPage.header.title")} - Klimatkollen`;
  const pageDescription = t("methodsPage.header.description");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("methodsPage.header.title"),
    description: pageDescription,
    url: canonicalUrl,
  };

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
      <div className="max-w-[1200px] mx-auto space-y-20">
        <PageHeader
          title={t("methodsPage.header.title")}
          description={t("methodsPage.header.description")}
        />

        <Accordion
          type="single"
          collapsible
          defaultValue="parisAgreement"
          className="space-y-6"
        >
          {/* Paris Agreement Section - Open by Default */}
          <AccordionGroup
            title={t("methodsPage.accordion.parisAgreement.title")}
            value="parisAgreement"
          >
            <div className="prose prose-invert w-[90%] max-w-5xl mx-auto space-y-4">
              <p>{t("methodsPage.accordion.parisAgreement.paragraph1")}</p>
              <p>
                <Trans
                  i18nKey="methodsPage.accordion.parisAgreement.paragraph2"
                  components={[
                    <a
                      title="IEA"
                      className="underline hover:text-white transition-colors"
                      href="https://www.iea.org/reports/co2-emissions-in-2023"
                      target="_blank"
                      rel="noopener noreferrer"
                    />,
                  ]}
                />
              </p>
              <p>{t("methodsPage.accordion.parisAgreement.paragraph3")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <LinkButton
                  title={t("methodsPage.accordion.parisAgreement.link.title")}
                  text={t("methodsPage.accordion.parisAgreement.link.text")}
                  link="https://www.naturvardsverket.se/parisavtalet"
                />
              </div>
            </div>
          </AccordionGroup>

          {/* Sources Section */}
          <AccordionGroup
            title={t("methodsPage.accordion.sources.title")}
            value="sources"
          >
            <div className="prose prose-invert w-[90%] max-w-5xl mx-auto space-y-8">
              <p>{t("methodsPage.accordion.sources.paragraph1")}</p>
              <p>{t("methodsPage.accordion.sources.paragraph2")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                {[
                  "smhi",
                  "skr",
                  "wikidata",
                  "trafikanalys",
                  "nvdb",
                  "sei",
                  "powerCircles",
                  "klimatplaner",
                  "upphandlingsmyndigheten",
                  "greenpeace",
                ].map((key) => (
                  <LinkButton
                    key={key}
                    title={t(
                      `methodsPage.accordion.sources.links.${key}.title`,
                    )}
                    text={t(`methodsPage.accordion.sources.links.${key}.text`)}
                    link={t(`methodsPage.accordion.sources.links.${key}.link`)}
                  />
                ))}
              </div>
            </div>
          </AccordionGroup>

          {/* Calculations Section */}
          <AccordionGroup
            title={t("methodsPage.accordion.calculations.title")}
            value="calculations"
          >
            <div className="prose prose-invert w-[90%] max-w-5xl mx-auto space-y-8">
              <p>{t("methodsPage.accordion.calculations.paragraph1")}</p>
              <p>
                <Trans
                  i18nKey="methodsPage.accordion.calculations.paragraph2"
                  components={[
                    <a
                      title="Här"
                      className="underline hover:text-white transition-colors"
                      href="https://docs.google.com/document/d/1MihysUkfunbV0LjwSUCiGSqWQSo5U03K0RMbRsVBL7U"
                      target="_blank"
                      rel="noopener noreferrer"
                    />,
                  ]}
                />
              </p>
            </div>
          </AccordionGroup>

          {/* CO2 Budgets Section */}
          <AccordionGroup
            title={t("methodsPage.accordion.co2Budgets.title")}
            value="co2Budgets"
          >
            <div className="prose prose-invert w-[90%] max-w-5xl mx-auto space-y-8">
              <p>{t("methodsPage.accordion.co2Budgets.paragraph1")}</p>
              <p>
                <Trans
                  i18nKey="methodsPage.accordion.co2Budgets.paragraph2"
                  components={[
                    <a
                      title="Uppsala universitet"
                      className="underline hover:text-white transition-colors"
                      href="https://www.cemus.uu.se/wp-content/uploads/2023/12/Paris-compliant-carbon-budgets-for-Swedens-counties-.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    />,
                  ]}
                />
              </p>
              <p>{t("methodsPage.accordion.co2Budgets.paragraph3")}</p>
              <p>{t("methodsPage.accordion.co2Budgets.paragraph4")}</p>
              <p>{t("methodsPage.accordion.co2Budgets.paragraph5")}</p>
              <p>{t("methodsPage.accordion.co2Budgets.paragraph6")}</p>
              <p>{t("methodsPage.accordion.co2Budgets.paragraph7")}</p>
              <p>
                <Trans
                  i18nKey="methodsPage.accordion.co2Budgets.paragraph8"
                  components={[
                    <a
                      title="Chalmers"
                      className="underline hover:text-white transition-colors"
                      href="https://research.chalmers.se/publication/530543/file/530543_Fulltext.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    />,
                  ]}
                />
              </p>
            </div>
          </AccordionGroup>

          {/* Emission Types Section */}
          <AccordionGroup
            title={t("methodsPage.accordion.emissionTypes.title")}
            value="emissionTypes"
          >
            <div className="prose prose-invert w-[90%] max-w-5xl mx-auto space-y-8">
              {[...Array(6).keys()].map((i) => (
                <p key={i}>
                  {t(`methodsPage.accordion.emissionTypes.paragraph${i + 1}`)}
                </p>
              ))}
            </div>
          </AccordionGroup>
        </Accordion>
      </div>
    </>
  );
}
