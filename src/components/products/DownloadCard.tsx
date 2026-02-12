import { LucideIcon, Download } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/contexts/ToastContext";
import { downloadCompanies, downloadMunicipalities } from "@/lib/api";

interface DownloadCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  format: "csv" | "json" | "xlsx";
  selectedType: "companies" | "municipalities";
  selectedYear: string;
  years: string[];
}

export function DownloadCard({
  icon: Icon,
  title,
  description,
  format,
  selectedType,
  selectedYear,
}: DownloadCardProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);

      const response =
        selectedType === "companies"
          ? await downloadCompanies(format, selectedYear || undefined)
          : await downloadMunicipalities(format);

      if (!(response instanceof Blob)) {
        throw new Error("Expected Blob response");
      }

      if (format === "json") {
        const text = await response.text();
        const jsonData = JSON.parse(text);
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
          type: "application/json",
        });
        downloadBlob(blob, format);
      } else {
        // For CSV and XLSX, use the blob directly from the API
        downloadBlob(response, format);
      }
    } catch (error) {
      console.error("Download failed:", error);
      showToast(t("common.error"), t("downloadsPage.downloadError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to handle the actual download
  const downloadBlob = (blob: Blob, format: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedType}_${selectedYear || "all"}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="block bg-black-2 rounded-level-2 p-8 space-y-8 transition-all duration-300 hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a] flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-lg bg-black-2 p-3 border border-black-1">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-light text-white">{title}</h3>
      </div>
      <p className="text-grey mb-8 min-h-[96px] md:min-h-[120px] flex-grow">
        {description}
      </p>
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-black-2 px-6 py-3 text-base font-medium text-blue-2 shadow-lg hover:bg-black-1 w-full transition-all border border-black-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-5 w-5" />
        {isLoading ? t("common.loading") : t(`downloadsPage.download`)}
      </button>
    </div>
  );
}
