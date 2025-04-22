import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Selector } from "@/components/layout/Selector";

interface DownloadControlsProps {
  onSelectionChange: (
    type: "companies" | "municipalities",
    year: string | null
  ) => void;
  years: string[];
}

export function DownloadControls({
  onSelectionChange,
  years,
}: DownloadControlsProps) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<
    "companies" | "municipalities"
  >("companies");
  const mostRecentYear = years[years.length - 1] || years[0] || "all";
  const [selectedYear, setSelectedYear] = useState<string>(mostRecentYear);

  useEffect(() => {
    onSelectionChange(selectedType, selectedYear === "all" ? null : selectedYear);
  }, [selectedType, selectedYear, onSelectionChange]);

  const typeOptions: { value: "companies" | "municipalities"; label: string }[] = [
    { value: "companies", label: t("downloadsPage.companies") },
    { value: "municipalities", label: t("downloadsPage.municipalities") },
  ];

  const sortedYears = [...years].sort((a, b) => parseInt(b) - parseInt(a));
  const yearOptions: { value: string; label: string }[] = [
    { value: "all", label: t("downloadsPage.allYears") },
    ...sortedYears.map((year) => ({ value: year, label: year })),
  ];

  return (
    <div className="flex gap-4 mb-8">
      <Selector
        label={t("downloadsPage.selectType")}
        value={selectedType}
        onValueChange={(value: "companies" | "municipalities") =>
          setSelectedType(value)
        }
        options={typeOptions}
        placeholder={t("downloadsPage.selectType")}
      />
      {selectedType === "companies" && (
        <Selector
          label={t("downloadsPage.selectYear")}
          value={selectedYear}
          onValueChange={(value) => setSelectedYear(value)}
          options={yearOptions}
          placeholder={t("downloadsPage.selectYear")}
        />
      )}
    </div>
  );
}
