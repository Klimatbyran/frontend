import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { buildAbsoluteUrl, getSiteOrigin } from "@/utils/seo";

export function useLandingPageSEO() {
  const { t } = useTranslation();

  const seoData = useMemo(() => {
    const pageTitle = `Klimatkollen - ${t("landingPage.metaTitle")}`;
    const pageDescription = t("landingPage.metaDescription");

    // Note: structuredData is not needed here - Layout component adds site-wide Organization/WebSite schema
    // This hook only provides page-specific data (title, description, typewriter texts)

    const typeWriterTexts = [
      t("landingPage.typewriter.reduceEmissions"),
      t("landingPage.typewriter.scope3Emissions"),
      t("landingPage.typewriter.meetParisAgreement"),
      t("landingPage.typewriter.climateActions"),
      t("landingPage.typewriter.climatePlans"),
    ];

    return {
      pageTitle,
      pageDescription,
      typeWriterTexts,
    };
  }, [t]);

  return seoData;
}
