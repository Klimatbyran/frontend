import { Text } from "@/components/ui/text";
import { Accordion } from "@/components/ui/accordion";
import { AccordionGroup } from "../components/layout/AccordionGroup";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/SEO/PageSEO";

export function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <>
      <PageSEO
        title={t("privacyPage.seoTitle")}
        description={t("privacyPage.seoDescription")}
        canonicalUrl="https://klimatkollen.se/privacy"
      >
        <h1>{t("privacyPage.seoHeading")}</h1>
        <p>{t("privacyPage.seoText")}</p>
      </PageSEO>

      <div className="max-w-[1200px] mx-auto space-y-8">
        <PageHeader
          title={t("privacyPage.title")}
          description={t("privacyPage.lastUpdated", { date: "2024-04-19" })}
        />
        <div className="bg-black-2 rounded-level-1 p-16 md:p-8 sm:p-4">
          <div className="flex flex-col md:flex-row items-start justify-between mb-12">
            <div className="space-y-4 w-full">
              <div className="flex flex-wrap items-center gap-4">
                <Text variant="h3" className="text-3xl md:text-3xl sm:text-2xl">
                  {t("privacyPage.responsibilityTitle")}
                </Text>
              </div>
              <Text
                variant="body"
                className="text-base md:text-base sm:text-sm max-w-3xl"
              >
                {t("privacyPage.responsibilityText")}
              </Text>
              <div className="flex flex-wrap items-center gap-4">
                <Text variant="h3" className="text-3xl md:text-3xl sm:text-2xl">
                  {t("privacyPage.dataCollectionTitle")}
                </Text>
              </div>
              <Text
                variant="body"
                className="text-base md:text-base sm:text-sm"
              >
                {t("privacyPage.dataCollectionText")}
              </Text>
            </div>
          </div>
        </div>
        <Accordion type="single" collapsible className="space-y-6">
          {/* Main Content */}
          <AccordionGroup title={t("privacyPage.whyTitle")} value="why">
            <div className="prose prose-invert w-[90%] max-w-5xl mx-auto space-y-4">
              <p>{t("privacyPage.whyText1")}</p>
              <p>{t("privacyPage.whyText2")}</p>
              <p>{t("privacyPage.whyText3")}</p>
            </div>
          </AccordionGroup>
        </Accordion>
        <div className="bg-blue-5/30 rounded-level-2 p-6 mt-8">
          <Text variant="h4">{t("privacyPage.contactTitle")}</Text>
          <Text className="text-grey">{t("privacyPage.contactText1")}</Text>
          <Text variant="body" className="text-blue-2 mt-2">
            <a
              href="mailto:hej@klimatkollen.se"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              hej@klimatkollen.se
            </a>
          </Text>
        </div>
      </div>
    </>
  );
}
