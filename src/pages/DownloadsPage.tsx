import { FileSpreadsheet, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import { DownloadCard } from "@/components/products/DownloadCard";
import { DownloadInfoSection } from "@/components/products/DownloadInfoSection";

function DownloadsPage() {
  const { t } = useTranslation();

  const infoItems = [
    {
      title: t("downloadsPage.dataStructure"),
      description: t("downloadsPage.dataStructureDescription"),
    },
    {
      title: t("downloadsPage.fileSizeAndFormat"),
      description: t("downloadsPage.fileSizeAndFormatDescription"),
    },
    {
      title: t("downloadsPage.usageLicense"),
      description: t("downloadsPage.usageLicenseDescription"),
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-20">
      <PageHeader
        title={t("downloadsPage.title")}
        description={t("downloadsPage.description")}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DownloadCard
            icon={FileText}
            title={t("downloadsPage.csvFormat")}
            description={t("downloadsPage.csvDescription")}
            downloadUrl="/downloads/database.csv"
            downloadText={t("downloadsPage.csvDownload")}
          />

          <DownloadCard
            icon={FileSpreadsheet}
            title={t("downloadsPage.excelFormat")}
            description={t("downloadsPage.excelDescription")}
            downloadUrl="/downloads/database.xlsx"
            downloadText={t("downloadsPage.excelDownload")}
          />

          <DownloadCard
            icon={FileText}
            title={t("downloadsPage.txtFormat")}
            description={t("downloadsPage.txtDescription")}
            downloadUrl="/downloads/database.txt"
            downloadText={t("downloadsPage.txtDownload")}
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
