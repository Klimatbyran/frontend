import { useTranslation } from "react-i18next";
import type { EditableReportingPeriod } from "@/types/company";
import { CompanyEditRow } from "./CompanyEditRow";
import {
  CompanyEditInputField,
  CompanyYearHeaderField,
} from "./CompanyEditField";

interface CompanyEditPeriodProps {
  periods: EditableReportingPeriod[];
  onInputChange: (name: string, value: string) => void;
  formData: Map<string, string>;
  resetPeriod: (identifier: string | number) => void;
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
        name={t("companyEditPage.sections.reportingPeriod")}
        key={"reporting-timespan"}
        headerName
        noHover
      >
        {periods.map((period: EditableReportingPeriod) => (
          <CompanyYearHeaderField
            key={period.id}
            text={period.endDate.substring(0, 4)}
            reset={resetPeriod}
            id={period.id}
          />
        ))}
      </CompanyEditRow>
      <CompanyEditRow
        name={t("companyEditPage.rowName.reportingStart")}
        key={"start-date"}
      >
        {periods.map((period: EditableReportingPeriod) => (
          <CompanyEditInputField
            key={period.id}
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
        {periods.map((period: EditableReportingPeriod) => (
          <CompanyEditInputField
            key={period.id}
            type="date"
            value={period.endDate.substring(0, 10)}
            name={`end-date-${period.id}`}
            displayAddition="none"
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
      <CompanyEditRow
        name={t("companyEditPage.rowName.reportURL")}
        key={"report-url"}
      >
        {periods.map((period: EditableReportingPeriod) => (
          <CompanyEditInputField
            key={period.id}
            type="text"
            value={period.reportURL ?? ""}
            name={`report-url-${period.id}`}
            displayAddition="none"
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
    </>
  );
}
