import { t } from "i18next";
import { PageSEO } from "@/components/SEO/PageSEO";
import { Municipality } from "@/types/municipality";
import { createEntityStructuredData } from "@/utils/detail/seo";

export function MunicipalityDetailSEO({
  id,
  municipality,
  lastYearEmissionsTon,
  lastYear,
}: {
  id: string;
  municipality: Municipality;
  lastYearEmissionsTon: string;
  lastYear: number | undefined;
}) {
  const canonicalUrl = `https://klimatkollen.se/municipalities/${id}`;
  const pageTitle = `${municipality.name} - ${t(
    "municipalityDetailPage.metaTitle",
  )} - Klimatkollen`;
  const pageDescription = t("municipalityDetailPage.metaDescription", {
    municipality: municipality.name,
    emissions: lastYearEmissionsTon,
    year: lastYear,
  });

  const structuredData = createEntityStructuredData(
    municipality.name,
    "municipality",
    municipality.region,
    pageDescription,
  );

  return (
    <PageSEO
      title={pageTitle}
      description={pageDescription}
      canonicalUrl={canonicalUrl}
      structuredData={structuredData}
    >
      <h1>
        {municipality.name} - {t("municipalityDetailPage.parisAgreement")}
      </h1>
      <p>
        {t("municipalityDetailPage.seoText.intro", {
          municipality: municipality.name,
          emissions: lastYearEmissionsTon,
          year: lastYear,
        })}
      </p>
      <h2>{t("municipalityDetailPage.seoText.emissionsHeading")}</h2>
      <h2>{t("municipalityDetailPage.seoText.climateGoalsHeading")}</h2>
      <p>
        {t("municipalityDetailPage.seoText.climateGoalsText", {
          municipality: municipality.name,
        })}
      </p>
      <h2>{t("municipalityDetailPage.seoText.consumptionHeading")}</h2>{" "}
      <p>
        {t("municipalityDetailPage.seoText.consumptionText", {
          municipality: municipality.name,
          consumption: municipality.totalConsumptionEmission.toFixed(1),
        })}
      </p>
      <h2>{t("municipalityDetailPage.seoText.transportHeading")}</h2>
      <p>
        {t("municipalityDetailPage.seoText.transportText", {
          municipality: municipality.name,
          bikeMeters: municipality.bicycleMetrePerCapita.toFixed(1),
          evGrowth: municipality.electricCarChangePercent.toFixed(1),
        })}
      </p>
    </PageSEO>
  );
}
