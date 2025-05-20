import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface YearSelectorProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  availableYears: number[];
  className?: string;
  includeLatestOption?: boolean;
  translateNamespace?: string;
}

export function YearSelector({
  selectedYear,
  onYearChange,
  availableYears,
  className = "w-full sm:w-[180px]",
  includeLatestOption = false,
  translateNamespace = "",
}: YearSelectorProps) {
  const { t } = useTranslation();

  const selectYearText = translateNamespace
    ? t(`${translateNamespace}.selectYear`)
    : t("common.selectYear");

  const latestYearText = translateNamespace
    ? t(`${translateNamespace}.latestYear`)
    : t("common.latestYear");

  return (
    <Select value={selectedYear} onValueChange={onYearChange}>
      <SelectTrigger className={`${className} bg-black-1`}>
        <SelectValue placeholder={selectYearText} />
      </SelectTrigger>
      <SelectContent>
        {includeLatestOption && (
          <SelectItem value="latest">{latestYearText}</SelectItem>
        )}
        {availableYears.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
