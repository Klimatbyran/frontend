import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Selector } from "@/components/layout/Selector";

export type DownloadDataType = "companies" | "municipalities" | "regions";

interface DownloadControlsProps {
  onSelectionChange: (type: DownloadDataType) => void;
}

export function DownloadControls({ onSelectionChange }: DownloadControlsProps) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<DownloadDataType>("companies");

  useEffect(() => {
    onSelectionChange(selectedType);
  }, [selectedType, onSelectionChange]);

  const typeOptions: {
    value: DownloadDataType;
    label: string;
  }[] = [
    { value: "companies", label: t("downloadsPage.companies") },
    { value: "municipalities", label: t("downloadsPage.municipalities") },
    { value: "regions", label: t("downloadsPage.regions") },
  ];

  return (
    <div className="flex gap-4 mb-8">
      <Selector
        label={t("downloadsPage.selectType")}
        value={selectedType}
        onValueChange={(value: DownloadDataType) => setSelectedType(value)}
        options={typeOptions}
        placeholder={t("downloadsPage.selectType")}
      />
    </div>
  );
}
