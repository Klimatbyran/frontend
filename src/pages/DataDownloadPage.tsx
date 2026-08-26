import { Building2, FileSpreadsheet, FileText, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useCallback, type ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DownloadCard } from "@/components/products/DownloadCard";
import { DownloadInfoSection } from "@/components/products/DownloadInfoSection";
import {
  DownloadControls,
  type DownloadDataType,
} from "@/components/products/DownloadControls";
import { UnearthCta } from "@/components/products/UnearthCta";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useLanguage } from "@/components/LanguageProvider";

interface InfoItem {
  title: string;
  description: string | ReactNode;
}

function DataDownloadPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [selectedType, setSelectedType] =
    useState<DownloadDataType>("companies");

  const handleSelectionChange = useCallback((type: DownloadDataType) => {
    setSelectedType(type);
  }, []);

  const extractHighlights = [
    {
      icon: <Building2 className="h-5 w-5 text-blue-3" />,
      title: t("dataDownloadPage.dataOverview.corporate.title"),
      description: t("dataDownloadPage.dataOverview.corporate.description"),
    },
    {
      icon: <FileText className="h-5 w-5 text-blue-3" />,
      title: t("dataDownloadPage.dataOverview.reports.title"),
      description: t("dataDownloadPage.dataOverview.reports.description"),
    },
    {
      icon: <MapPin className="h-5 w-5 text-blue-3" />,
      title: t("dataDownloadPage.dataOverview.municipality.title"),
      description: t("dataDownloadPage.dataOverview.municipality.description"),
    },
  ] as const;

  const infoItems: InfoItem[] = [
    {
      title: t("downloadsPage.dataStructure"),
      description: t("downloadsPage.dataStructureDescription"),
    },
    {
      title: t("downloadsPage.fileSizeAndFormat"),
      description: (
        <div className="space-y-3">
          <p>{t("downloadsPage.fileSizeAndFormatDescription.csv")}</p>
          <p>{t("downloadsPage.fileSizeAndFormatDescription.excel")}</p>
          <p>{t("downloadsPage.fileSizeAndFormatDescription.json")}</p>
        </div>
      ),
    },
    {
      title: t("downloadsPage.usageLicense"),
      description: t("downloadsPage.usageLicenseDescription"),
    },
  ];

  const pageTitle = `${t("dataDownloadPage.title")} - Klimatkollen`;
  const pageDescription = t("dataDownloadPage.description");
  const canonicalUrl = `https://klimatkollen.se/${currentLanguage}/data-download`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("dataDownloadPage.title"),
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

      <div className="mx-auto max-w-[1200px] px-4 text-white md:px-6">
        <PageHeader
          title={t("dataDownloadPage.title")}
          description={t("dataDownloadPage.description")}
        />

        <section className="mb-12 rounded-level-1 bg-black-2 p-6 md:p-8">
          <h2 className="mb-2 text-xl font-medium text-white">
            {t("dataDownloadPage.freeAccess.title")}
          </h2>
          <p className="mb-4 max-w-3xl text-grey">
            {t("dataDownloadPage.freeAccess.description")}
          </p>
          <ul className="mb-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li className="flex items-center gap-2 text-sm text-grey">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-3" />
              {t("dataDownloadPage.freeAccess.export")}
            </li>
            <li className="flex items-center gap-2 text-sm text-grey">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-3" />
              {t("dataDownloadPage.freeAccess.license")}
            </li>
          </ul>

          <div className="grid grid-cols-1 gap-6 border-t border-black-1 pt-8 md:grid-cols-3">
            {extractHighlights.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="rounded-full bg-black-1 p-3">{item.icon}</div>
                <div>
                  <h3 className="mb-1 text-base font-medium text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-grey">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <DownloadControls onSelectionChange={handleSelectionChange} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <DownloadCard
              icon={FileText}
              title={t("downloadsPage.csvFormat")}
              description={t("downloadsPage.csvDescription")}
              format="csv"
              selectedType={selectedType}
            />
            <DownloadCard
              icon={FileSpreadsheet}
              title={t("downloadsPage.excelFormat")}
              description={t("downloadsPage.excelDescription")}
              format="xlsx"
              selectedType={selectedType}
            />
            <DownloadCard
              icon={FileText}
              title={t("downloadsPage.jsonFormat")}
              description={t("downloadsPage.jsonDescription")}
              format="json"
              selectedType={selectedType}
            />
          </div>
        </section>

        <UnearthCta />

        <DownloadInfoSection
          title={t("downloadsPage.downloadInformation")}
          items={infoItems}
        />
      </div>
    </>
  );
}

export default DataDownloadPage;
