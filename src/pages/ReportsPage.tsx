import { useTranslation } from "react-i18next";
import { ContentGridPage } from "@/components/layout/ContentGridPage";
import { ContentCard } from "@/components/layout/ContentCard";
import { reports } from "@/lib/constants/reports";
import { useLanguage } from "@/components/LanguageProvider";

export function ReportsPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // First, get all reports in the current language
  const reportsInCurrentLanguage = reports.filter(
    (report) => report.language === currentLanguage,
  );

  // If there are no reports in the current language, use Swedish reports
  const languageFilteredReports =
    reportsInCurrentLanguage.length > 0
      ? reportsInCurrentLanguage
      : reports.filter((report) => report.language === "sv");

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

  const items = languageFilteredReports.map((report) => ({
    id: report.id.toString(),
    title: report.title,
    excerpt: report.excerpt,
    image: report.coverImage,
    category: report.category,
    date: report.date,
    readTime: report.readTime,
    link: report.pdfUrl,
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
