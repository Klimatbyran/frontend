import { useTranslation } from "react-i18next";
import { ContentGridPage } from "@/components/layout/ContentGridPage";
import { ContentCard } from "@/components/layout/ContentCard";
import { reports } from "@/lib/constants/reports";
import { useLanguage } from "@/components/LanguageProvider";

export function ReportsPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Only show reports if the report's displayLanguages array includes the current language or 'all'
  const languageFilteredReports = reports.filter((report) => {
    if (!Array.isArray(report.displayLanguages)) return false;
    return (
      report.displayLanguages
        .map((l) => l.toLowerCase())
        .includes(currentLanguage.toLowerCase()) ||
      report.displayLanguages.map((l) => l.toLowerCase()).includes("all")
    );
  });

  const canonicalUrl = "https://klimatkollen.se/reports";
  const pageTitle = t("reportsPage.title");
  const pageDescription = t("reportsPage.description");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: languageFilteredReports.map((report, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://klimatkollen.se/reports/${report.id}`,
        name: report.title,
      })),
    },
  };

  // Sort by most recent date first
  const sortedReports = [...languageFilteredReports].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const items = sortedReports.map((report) => ({
    id: report.id.toString(),
    title: report.title,
    excerpt: report.excerpt,
    image: report.image || "",
    category: report.category,
    date: report.date,
    readTime: report.readTime,
    link: report.link || "",
    language: report.language,
  }));

  return (
    <ContentGridPage
      title={pageTitle}
      description={pageDescription}
      canonicalUrl={canonicalUrl}
      items={items}
      renderCard={(item) => <ContentCard item={item} basePath="reports" />}
      structuredData={structuredData}
    />
  );
}
