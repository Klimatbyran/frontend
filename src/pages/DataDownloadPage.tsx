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

interface DataCategoryProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function DataCategory({ icon, title, description }: DataCategoryProps) {
  return (
    <div className="border border-black-2 bg-black-2 p-6 transition-colors hover:border-black-1 first:rounded-t-lg last:rounded-b-lg md:first:rounded-l-lg md:first:rounded-tr-none md:last:rounded-r-lg md:last:rounded-bl-none">
      <div className="mb-3 flex items-center gap-3 text-white">
        {icon}
        <h3 className="text-lg font-light">{title}</h3>
      </div>
      <p className="text-grey">{description}</p>
    </div>
  );
}

function DataDownloadPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [selectedType, setSelectedType] =
    useState<DownloadDataType>("companies");

  const handleSelectionChange = useCallback((type: DownloadDataType) => {
    setSelectedType(type);
  }, []);

  const infoItems: InfoItem[] = [
    {
      title: t("downloadsPage.dataStructure"),
      description: t("downloadsPage.dataStructureDescription"),
    },
    {
      title: t("downloadsPage.fileSizeAndFormat"),
      description: (
        <div className="space-y-4">
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

      <div className="mx-auto max-w-[1200px]">
        <PageHeader
          title={t("dataDownloadPage.title")}
          description={t("dataDownloadPage.description")}
        />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
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

          <div className="mx-auto mb-8 mt-16 max-w-7xl">
            <h2 className="mb-8 text-center text-2xl font-light text-white">
              {t("dataDownloadPage.dataOverview.title")}
            </h2>
            <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
              <DataCategory
                icon={<Building2 className="h-5 w-5 text-grey" />}
                title={t("dataDownloadPage.dataOverview.corporate.title")}
                description={t(
                  "dataDownloadPage.dataOverview.corporate.description",
                )}
              />
              <DataCategory
                icon={<FileText className="h-5 w-5 text-grey" />}
                title={t("dataDownloadPage.dataOverview.reports.title")}
                description={t(
                  "dataDownloadPage.dataOverview.reports.description",
                )}
              />
              <DataCategory
                icon={<MapPin className="h-5 w-5 text-grey" />}
                title={t("dataDownloadPage.dataOverview.municipality.title")}
                description={t(
                  "dataDownloadPage.dataOverview.municipality.description",
                )}
              />
            </div>
          </div>

          <UnearthCta />

          <DownloadInfoSection
            title={t("downloadsPage.downloadInformation")}
            items={infoItems}
          />
        </div>
      </div>
    </>
  );
}

export default DataDownloadPage;
