import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddReportPeriodModalProps {
  isOpen: boolean;
  year: string;
  onYearChange: (value: string) => void;
  onAdd: () => void;
  onCancel: () => void;
}

export function AddReportPeriodModal({
  isOpen,
  year,
  onYearChange,
  onAdd,
  onCancel,
}: AddReportPeriodModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-black-2 p-6 rounded-lg max-w-sm w-full mx-4 border border-black-1">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("companyEditPage.addReportPeriod.title")}
        </h3>
        <Label htmlFor="new-period-year" className="text-foreground">
          {t("companyEditPage.addReportPeriod.yearLabel")}
        </Label>
        <Input
          id="new-period-year"
          type="number"
          min={2000}
          max={2030}
          placeholder="2024"
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          className="mt-2 mb-6 w-full bg-black-1 border text-foreground"
        />
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            {t("companyEditPage.unsavedChanges.cancel")}
          </Button>
          <Button
            onClick={onAdd}
            disabled={!/^\d{4}$/.test(year.trim())}
          >
            {t("companyEditPage.addReportPeriod.add")}
          </Button>
        </div>
      </div>
    </div>
  );
}
