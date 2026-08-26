import { LucideIcon, Download } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/contexts/ToastContext";
import {
  downloadCompanies,
  downloadMunicipalities,
  downloadRegions,
} from "@/lib/api";
import type { DownloadDataType } from "@/components/products/DownloadControls";

/** Matches API free database download year (export always returns this year). */
const FREE_DATABASE_DOWNLOAD_YEAR = "2024";

interface DownloadCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  format: "csv" | "json" | "xlsx";
  selectedType: DownloadDataType;
}

export function DownloadCard({
  icon: Icon,
  title,
  description,
  format,
  selectedType,
}: DownloadCardProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);

      const response =
        selectedType === "companies"
          ? await downloadCompanies(format, FREE_DATABASE_DOWNLOAD_YEAR)
          : selectedType === "municipalities"
            ? await downloadMunicipalities(format)
            : await downloadRegions(format);

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
        downloadBlob(response, format);
      }
    } catch (error) {
      console.error("Download failed:", error);
      showToast(t("common.error"), t("downloadsPage.downloadError"));
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBlob = (blob: Blob, format: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedType}_${FREE_DATABASE_DOWNLOAD_YEAR}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="flex h-full flex-col space-y-6 rounded-level-2 bg-black-2 p-6 transition-all duration-300 hover:bg-[#1a1a1a] hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] md:p-8">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-black-1 p-3">
          <Icon className="h-5 w-5 text-blue-2" />
        </div>
        <h3 className="text-xl font-medium text-white">{title}</h3>
      </div>
      <p className="min-h-[72px] flex-grow text-grey md:min-h-[96px]">
        {description}
      </p>
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-5 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-4 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="h-5 w-5" />
        {isLoading ? t("common.loading") : t(`downloadsPage.download`)}
      </button>
    </div>
  );
}
