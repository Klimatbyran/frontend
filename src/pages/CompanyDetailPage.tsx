import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCompanyDetails } from "@/hooks/companies/useCompanyDetails";
import { CompanyOverview } from "@/components/companies/detail/overview/CompanyOverview";
import { CompanyHistory } from "@/components/companies/detail/CompanyHistory";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/SEO/PageSEO";
import { createSlug } from "@/lib/utils";
import { CompanyScope3 } from "@/components/companies/detail/CompanyScope3";
import { getCompanyDescription } from "@/utils/business/company";
import { useLanguage } from "@/components/LanguageProvider";

export function CompanyDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string; slug?: string }>();
  // The id parameter is always the Wikidata ID (Q-number)
  // It's either directly from /companies/:id or extracted from /foretag/:slug-:id
  const { company, loading, error } = useCompanyDetails(id!);
  const [selectedYear, setSelectedYear] = useState<string>("latest");
  const { currentLanguage } = useLanguage();
  const description = company
    ? getCompanyDescription(company, currentLanguage)
    : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-16">
        <div className="h-12 w-1/3 bg-black-1 rounded" />
        <div className="h-96 bg-black-1 rounded-level-1" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <Text variant="h3" className="text-red-500 mb-4">
          {t("companyDetailPage.errorTitle")}
        </Text>
        <Text variant="body">{t("companyDetailPage.errorDescription")}</Text>
      </div>
    );
  }

  if (!company || !company.reportingPeriods.length) {
    return (
      <div className="text-center py-24">
        <Text variant="h3" className="text-red-500 mb-4">
          {t("companyDetailPage.notFoundTitle")}
        </Text>
        <Text variant="body">{t("companyDetailPage.notFoundDescription")}</Text>
      </div>
    );
  }

  const sortedPeriods = [...company.reportingPeriods].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  );

  const selectedPeriod =
    selectedYear === "latest"
      ? sortedPeriods[0]
      : sortedPeriods.find(
          (p) => new Date(p.endDate).getFullYear().toString() === selectedYear,
        ) || sortedPeriods[0];

  const selectedIndex = sortedPeriods.findIndex(
    (p) => p.endDate === selectedPeriod.endDate,
  );
  const previousPeriod =
    selectedIndex < sortedPeriods.length - 1
      ? sortedPeriods[selectedIndex + 1]
      : undefined;

  // Get the latest reporting period for SEO content
  const latestPeriod = sortedPeriods[0];
  const latestYear = latestPeriod
    ? new Date(latestPeriod.endDate).getFullYear()
    : new Date().getFullYear();

  // Calculate total emissions for SEO content
  const totalEmissions = latestPeriod?.emissions?.calculatedTotalEmissions;
  const formattedEmissions = totalEmissions
    ? totalEmissions >= 1000
      ? (totalEmissions / 1000).toFixed(1) + " tusen"
      : totalEmissions.toFixed(1)
    : "N/A";

  // Get industry for SEO content
  const industry =
    company.industry?.industryGics?.sv?.sectorName ||
    t("companyDetailPage.unknownIndustry");

  // Prepare SEO data
  const canonicalUrl = `https://klimatkollen.se/foretag/${createSlug(
    company.name,
  )}-${id}`;
  const pageTitle = `${company.name} - ${t(
    "companyDetailPage.metaTitle",
  )} - Klimatkollen`;
  const pageDescription = t("companyDetailPage.metaDescription", {
    company: company.name,
    industry: industry,
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    description: description,
    url: canonicalUrl,
    industry: industry,
  };

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      >
        <h1>
          {company.name} - {t("companyDetailPage.seoText.climateData")}
        </h1>
        <p>
          {t("companyDetailPage.seoText.intro", {
            company: company.name,
            industry: industry,
          })}
        </p>
        <h2>{t("companyDetailPage.seoText.emissionsHeading")}</h2>
        <p>
          {t("companyDetailPage.seoText.emissionsText", {
            company: company.name,
            emissions: formattedEmissions,
            year: latestYear,
          })}
        </p>
        <h2>{t("companyDetailPage.seoText.industryHeading")}</h2>
        <p>
          {t("companyDetailPage.seoText.industryText", {
            company: company.name,
            industry: industry,
          })}
        </p>
        {company.goals && company.goals.length > 0 && (
          <>
            <h2>{t("companyDetailPage.seoText.goalsHeading")}</h2>
            <p>
              {t("companyDetailPage.seoText.goalsText", {
                company: company.name,
              })}
            </p>
          </>
        )}
        {company.initiatives && company.initiatives.length > 0 && (
          <>
            <h2>{t("companyDetailPage.seoText.initiativesHeading")}</h2>
            <p>
              {t("companyDetailPage.seoText.initiativesText", {
                company: company.name,
              })}
            </p>
          </>
        )}
      </PageSEO>

      <div className="space-y-8 md:space-y-16 max-w-[1400px] mx-auto">
        <CompanyOverview
          company={company}
          selectedPeriod={selectedPeriod}
          previousPeriod={previousPeriod}
          onYearSelect={setSelectedYear}
          selectedYear={selectedYear}
        />

        <CompanyHistory company={company} />
        <CompanyScope3
          emissions={selectedPeriod.emissions!}
          historicalData={sortedPeriods
            .filter(
              (period) =>
                period.emissions?.scope3?.categories &&
                period.emissions.scope3.categories.length > 0,
            )
            .map((period) => ({
              year: new Date(period.endDate).getFullYear(),
              total: period.emissions!.scope3!.calculatedTotalEmissions!,
              unit:
                period.emissions!.scope3!.statedTotalEmissions?.unit ||
                t("emissionsUnit"),
              categories: period
                .emissions!.scope3!.categories!.filter(
                  (cat) => cat.total !== null,
                )
                .map((cat) => ({
                  category: cat.category,
                  total: cat.total as number,
                  unit: cat.unit,
                })),
            }))
            .sort((a, b) => a.year - b.year)}
        />
      </div>
    </>
  );
}
