import { useTranslation } from "react-i18next";
import { Selector } from "@/components/layout/Selector";

export type DownloadDataType = "companies" | "municipalities" | "regions";

interface DownloadControlsProps {
  value: DownloadDataType;
  onChange: (type: DownloadDataType) => void;
}

export function DownloadControls({ value, onChange }: DownloadControlsProps) {
  const { t } = useTranslation();

  const typeOptions: {
    value: DownloadDataType;
    label: string;
  }[] = [
    { value: "companies", label: t("downloadsPage.companies") },
    { value: "municipalities", label: t("downloadsPage.municipalities") },
    { value: "regions", label: t("downloadsPage.regions") },
  ];

  return (
    <Selector
      label={t("downloadsPage.selectType")}
      value={value}
      onValueChange={onChange}
      options={typeOptions}
      placeholder={t("downloadsPage.selectType")}
    />
  );
}
