import {
  Building2,
  FileSpreadsheet,
  FileText,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  DownloadCard,
  type DownloadFormat,
} from "@/components/products/DownloadCard";
import { DownloadInfoSection } from "@/components/products/DownloadInfoSection";
import {
  DownloadControls,
  type DownloadDataType,
} from "@/components/products/DownloadControls";
import { UnearthCta } from "@/components/products/UnearthCta";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useLanguage } from "@/components/LanguageProvider";

const HIGHLIGHT_KEYS = ["one", "two", "three"] as const;

const EXTRACT_HIGHLIGHT_ICONS: Record<
  DownloadDataType,
  readonly [LucideIcon, LucideIcon, LucideIcon]
> = {
  companies: [Building2, FileText, FileSpreadsheet],
  municipalities: [MapPin, FileText, Building2],
  regions: [MapPin, Building2, FileText],
};

const DOWNLOAD_FORMATS: {
  format: DownloadFormat;
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
}[] = [
  {
    format: "csv",
    icon: FileText,
    titleKey: "downloadsPage.csvFormat",
    descriptionKey: "downloadsPage.csvDescription",
  },
  {
    format: "xlsx",
    icon: FileSpreadsheet,
    titleKey: "downloadsPage.excelFormat",
    descriptionKey: "downloadsPage.excelDescription",
  },
  {
    format: "json",
    icon: FileText,
    titleKey: "downloadsPage.jsonFormat",
    descriptionKey: "downloadsPage.jsonDescription",
  },
];

function ExtractHighlight({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-black-1 p-3">
        <Icon className="h-5 w-5 text-blue-3" />
      </div>
      <div>
        <h3 className="mb-1 text-base font-medium text-white">{title}</h3>
        <p className="text-sm text-grey">{description}</p>
      </div>
    </div>
  );
}

function DataDownloadPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [selectedType, setSelectedType] =
    useState<DownloadDataType>("companies");

  const highlightIcons = EXTRACT_HIGHLIGHT_ICONS[selectedType];
  const infoItems: Array<{ title: string; description: string | ReactNode }> = [
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

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: t("dataDownloadPage.title"),
          description: pageDescription,
          url: canonicalUrl,
        }}
      />

      <div className="mx-auto max-w-[1200px] px-4 text-white md:px-6">
        <PageHeader
          title={t("dataDownloadPage.title")}
          description={t("dataDownloadPage.description")}
        />

        <section className="mb-16 rounded-level-1 bg-black-2 p-6 md:p-8">
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

          <div className="mb-8 max-w-md border-t border-black-1 pt-8">
            <DownloadControls value={selectedType} onChange={setSelectedType} />
          </div>

          <div className="mb-8">
            <p className="mb-4 text-sm text-grey">
              {t(`dataDownloadPage.included.${selectedType}.summary`)}
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {HIGHLIGHT_KEYS.map((key, index) => (
                <ExtractHighlight
                  key={`${selectedType}-${key}`}
                  icon={highlightIcons[index]}
                  title={t(
                    `dataDownloadPage.included.${selectedType}.${key}.title`,
                  )}
                  description={t(
                    `dataDownloadPage.included.${selectedType}.${key}.description`,
                  )}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-black-1 pt-8">
            <h3 className="mb-6 text-lg font-medium text-white">
              {t("dataDownloadPage.chooseFormat")}
            </h3>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {DOWNLOAD_FORMATS.map((option) => (
                <DownloadCard
                  key={option.format}
                  icon={option.icon}
                  title={t(option.titleKey)}
                  description={t(option.descriptionKey)}
                  format={option.format}
                  selectedType={selectedType}
                />
              ))}
            </div>
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
