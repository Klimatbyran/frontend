import { FileSpreadsheet, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useCallback, type ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DownloadCard } from "@/components/products/DownloadCard";
import { DownloadInfoSection } from "@/components/products/DownloadInfoSection";
import {
  DownloadControls,
  type DownloadDataType,
} from "@/components/products/DownloadControls";

interface InfoItem {
  title: string;
  description: string | ReactNode;
}

function DownloadsPage() {
  const { t } = useTranslation();
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

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title={t("downloadsPage.title")}
        description={t("downloadsPage.description")}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <DownloadControls onSelectionChange={handleSelectionChange} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        <DownloadInfoSection
          title={t("downloadsPage.downloadInformation")}
          items={infoItems}
        />
      </div>
    </div>
  );
}

export default DownloadsPage;
