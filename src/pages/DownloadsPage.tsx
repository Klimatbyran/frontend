import { FileSpreadsheet, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect, type ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DownloadCard } from "@/components/products/DownloadCard";
import { DownloadInfoSection } from "@/components/products/DownloadInfoSection";
import { DownloadControls } from "@/components/products/DownloadControls";
import { getReportingYears } from "@/lib/api";

interface InfoItem {
  title: string;
  description: string | ReactNode;
}

function DownloadsPage() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<
    "companies" | "municipalities"
  >("companies");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    getReportingYears().then(setYears);
  }, []);

  const handleSelectionChange = (
    type: "companies" | "municipalities",
    year: string | null,
  ) => {
    setSelectedType(type);
    setSelectedYear(year || "");
  };

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
        <DownloadControls
          onSelectionChange={handleSelectionChange}
          years={years}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DownloadCard
            icon={FileText}
            title={t("downloadsPage.csvFormat")}
            description={t("downloadsPage.csvDescription")}
            format="csv"
            selectedType={selectedType}
            selectedYear={selectedYear}
            years={years}
          />

          <DownloadCard
            icon={FileSpreadsheet}
            title={t("downloadsPage.excelFormat")}
            description={t("downloadsPage.excelDescription")}
            format="xlsx"
            selectedType={selectedType}
            selectedYear={selectedYear}
            years={years}
          />

          <DownloadCard
            icon={FileText}
            title={t("downloadsPage.jsonFormat")}
            description={t("downloadsPage.jsonDescription")}
            format="json"
            selectedType={selectedType}
            selectedYear={selectedYear}
            years={years}
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
