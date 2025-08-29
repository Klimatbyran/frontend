import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCompanyDetails } from "@/hooks/companies/useCompanyDetails";
import { CompanyOverview } from "@/components/companies/detail/overview/CompanyOverview";
import { CompanyHistory } from "@/components/companies/detail/CompanyHistory";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/PageSEO";
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
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Total Emissions",
        value: `${formattedEmissions} ${t("emissionsUnit")}`,
        unitText: t("emissionsUnit"),
        valueReference: {
          "@type": "QuantitativeValue",
          value: totalEmissions || 0,
          unitText: t("emissionsUnit"),
        },
      },
      {
        "@type": "PropertyValue",
        name: "Reporting Year",
        value: latestYear.toString(),
      },
      {
        "@type": "PropertyValue",
        name: "Industry Sector",
        value: industry,
      },
      {
        "@type": "PropertyValue",
        name: "Reporting Periods",
        value: sortedPeriods.length,
        unitText: "years",
      },
      {
        "@type": "PropertyValue",
        name: "Latest Reporting Date",
        value: latestPeriod
          ? new Date(latestPeriod.endDate).toISOString().split("T")[0]
          : "N/A",
      },
      {
        "@type": "PropertyValue",
        name: "Scope 1 Emissions",
        value: latestPeriod?.emissions?.scope1?.total
          ? `${latestPeriod.emissions.scope1.total.toFixed(1)} ${t("emissionsUnit")}`
          : "N/A",
        unitText: t("emissionsUnit"),
      },
      {
        "@type": "PropertyValue",
        name: "Scope 2 Emissions",
        value: latestPeriod?.emissions?.scope2?.calculatedTotalEmissions
          ? `${latestPeriod.emissions.scope2.calculatedTotalEmissions.toFixed(1)} ${t("emissionsUnit")}`
          : "N/A",
        unitText: t("emissionsUnit"),
      },
      {
        "@type": "PropertyValue",
        name: "Scope 3 Emissions",
        value: latestPeriod?.emissions?.scope3?.calculatedTotalEmissions
          ? `${latestPeriod.emissions.scope3.calculatedTotalEmissions.toFixed(1)} ${t("emissionsUnit")}`
          : "N/A",
        unitText: t("emissionsUnit"),
      },
      {
        "@type": "PropertyValue",
        name: "Data Coverage",
        value: `${new Date(sortedPeriods[sortedPeriods.length - 1].endDate).getFullYear()} - ${new Date(sortedPeriods[0].endDate).getFullYear()}`,
        description: "Years covered by emissions data",
      },
      ...(company.goals && company.goals.length > 0
        ? [
            {
              "@type": "PropertyValue",
              name: "Climate Goals",
              value: company.goals.map((goal) => goal.description).join(", "),
              description: `${company.goals.length} climate goals set by the company`,
            },
          ]
        : []),
      ...(company.initiatives && company.initiatives.length > 0
        ? [
            {
              "@type": "PropertyValue",
              name: "Climate Initiatives",
              value: company.initiatives
                .map((initiative) => initiative.title)
                .join(", "),
              description: `${company.initiatives.length} active climate initiatives`,
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />

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
