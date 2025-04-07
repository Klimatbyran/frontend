import { CalendarDays, Clock, ArrowUpRight } from "lucide-react";
import { Text } from "@/components/ui/text";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useEffect } from "react";
import { reports } from "@/lib/constants/reports";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";

// Component for report metadata (category, date, read time)
function ReportMeta({
  category,
  date,
  readTime,
}: {
  category: string;
  date: string;
  readTime: string;
}) {
  const isMobile = useScreenSize();

  return (
    <div className="flex items-center gap-4">
      <span
        aria-label="Category"
        className={`py-1 bg-blue-5/50 rounded-full text-blue-2 text-sm ${isMobile ? "px-2" : "px-3"}`}
      >
        {category}
      </span>
      <div className="flex items-center gap-2 text-grey text-sm">
        <CalendarDays className="w-4 h-4" />
        <span aria-label="Date Published">
          {new Date(date).toLocaleDateString("sv-SE")}
        </span>
      </div>
      <div className="flex items-center gap-2 text-grey text-sm">
        <Clock className="w-4 h-4" />
        <span aria-label="Read Time">{readTime}</span>
      </div>
    </div>
  );
}

// Component for report cards
function ReportCard({ report }: { report: (typeof reports)[number] }) {
  const { t } = useTranslation();
  const isMobile = useScreenSize();

  return (
    <a
      href={report.pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-black-2 rounded-level-2 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]"
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={report.coverImage}
          alt={report.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className={`space-y-4 ${isMobile ? "p-4" : "p-8"}`}>
        <ReportMeta
          category={report.category}
          date={report.date}
          readTime={report.readTime}
        />
        <Text
          variant="h4"
          className="group-hover:text-blue-2 transition-colors"
        >
          {report.title}
        </Text>
        <Text className="text-grey">{report.excerpt}</Text>
        <div className="flex items-center gap-2 text-blue-2 group-hover:gap-3 transition-all">
          <span aria-label="Click to read full article">
            {t("insightsPage.readMore")}
          </span>
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </a>
  );
}

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prepare SEO data
  const canonicalUrl = "https://klimatkollen.se/reports";
  const pageTitle = `${t("reportsPage.title")} - Klimatkollen`;
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

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
      <div className="w-full max-w-[1200px] mx-auto space-y-8">
        <PageHeader
          title={t("reportsPage.title")}
          description={t("reportsPage.description")}
        />
        <div className="max-w-[1150px] mx-auto space-y-8">
          {/* Post Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {languageFilteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
