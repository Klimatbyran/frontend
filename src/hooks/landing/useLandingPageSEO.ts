import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const CANONICAL_URL = "https://klimatkollen.se";
const LOGO_URL = "https://klimatkollen.se/images/social-picture.png";

export function useLandingPageSEO() {
  const { t } = useTranslation();

  const seoData = useMemo(() => {
    const pageTitle = `Klimatkollen - ${t("landingPage.metaTitle")}`;
    const pageDescription = t("landingPage.metaDescription");

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Klimatkollen",
      url: CANONICAL_URL,
      logo: LOGO_URL,
      description: pageDescription,
    };

    const typeWriterTexts = [
      t("landingPage.typewriter.reduceEmissions"),
      t("landingPage.typewriter.scope3Emissions"),
      t("landingPage.typewriter.meetParisAgreement"),
      t("landingPage.typewriter.climateActions"),
      t("landingPage.typewriter.climatePlans"),
    ];

    return {
      canonicalUrl: CANONICAL_URL,
      pageTitle,
      pageDescription,
      structuredData,
      typeWriterTexts,
    };
  }, [t]);

  return seoData;
}
