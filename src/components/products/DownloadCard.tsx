import { Download, type LucideIcon } from "lucide-react";
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
export const FREE_DATABASE_DOWNLOAD_YEAR = "2024";

export type DownloadFormat = "csv" | "json" | "xlsx";

interface DownloadCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  format: DownloadFormat;
  selectedType: DownloadDataType;
}

async function fetchDownloadBlob(
  selectedType: DownloadDataType,
  format: DownloadFormat,
): Promise<Blob> {
  const response =
    selectedType === "companies"
      ? await downloadCompanies(format, FREE_DATABASE_DOWNLOAD_YEAR)
      : selectedType === "municipalities"
        ? await downloadMunicipalities(format)
        : await downloadRegions(format);

  if (!(response instanceof Blob)) {
    throw new Error("Expected Blob response");
  }

  if (format !== "json") {
    return response;
  }

  const jsonData = JSON.parse(await response.text());
  return new Blob([JSON.stringify(jsonData, null, 2)], {
    type: "application/json",
  });
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
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
      const blob = await fetchDownloadBlob(selectedType, format);
      triggerBrowserDownload(
        blob,
        `${selectedType}_${FREE_DATABASE_DOWNLOAD_YEAR}.${format}`,
      );
    } catch (error) {
      console.error("Download failed:", error);
      showToast(t("common.error"), t("downloadsPage.downloadError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6 rounded-level-2 bg-black-1 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-black-2 p-3">
          <Icon className="h-5 w-5 text-blue-2" />
        </div>
        <h3 className="text-xl font-medium text-white">{title}</h3>
      </div>
      <p className="min-h-[72px] flex-grow text-grey md:min-h-[96px]">
        {description}
      </p>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-5 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-4 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="h-5 w-5" />
        {isLoading ? t("common.loading") : t("downloadsPage.download")}
      </button>
    </div>
  );
}
