import { CompanyEditRow } from "./CompanyEditRow";
import {
  CompanyEditInputField,
  CompanyYearHeaderField,
} from "./CompanyEditField";
import { useTranslation } from "react-i18next";
import type { ReportingPeriod } from "@/types/company";

interface CompanyEditPeriodProps {
  periods: ReportingPeriod[];
  onInputChange: (name: string, value: string) => void;
  formData: Map<string, string>;
  resetPeriod: (year: number) => void;
}

export function CompanyEditPeriod({
  periods,
  onInputChange,
  formData,
  resetPeriod,
}: CompanyEditPeriodProps) {
  const { t } = useTranslation();
  return (
    <>
      <CompanyEditRow
        name={t("companyEditPage.rowName.reportingTimespan")}
        key={"reporting-timespan"}
        headerName
        noHover
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyYearHeaderField
            text={period.endDate.substring(0, 4)}
            reset={resetPeriod}
            id={Number(period.id)}
          />
        ))}
      </CompanyEditRow>
      <CompanyEditRow
        name={t("companyEditPage.rowName.reportingStart")}
        key={"start-date"}
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            type="date"
            value={period.startDate.substring(0, 10)}
            name={`start-date-${period.id}`}
            displayAddition="none"
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
      <CompanyEditRow
        name={t("companyEditPage.rowName.reportingEnd")}
        key={"end-date"}
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            type="date"
            value={period.endDate.substring(0, 10)}
            name={`end-date-${period.id}`}
            displayAddition="none"
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
    </>
  );
}
