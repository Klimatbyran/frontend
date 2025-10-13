import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField } from "./CompanyEditField";
import { useTranslation } from "react-i18next";
import type { ReportingPeriod } from "@/types/company";

interface CompanyEditEmployeesProps {
  periods: ReportingPeriod[];
  onInputChange: (name: string, value: string) => void;
  formData: Map<string, string>;
}

export function CompanyEditEmployees({
  periods,
  onInputChange,
  formData,
}: CompanyEditEmployeesProps) {
  const { t } = useTranslation();

  return (
    <>
      <CompanyEditRow
        key={"employees-value"}
        name={t("companyEditPage.rowName.employees")}
        headerName
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            name={`employees-value-${period.id}`}
            type="number"
            key={`employees-value-${period.id}`}
            displayAddition="verification"
            value={
              period.economy?.employees?.value === undefined ||
              period.economy?.employees?.value === null
                ? ""
                : period.economy?.employees?.value
            }
            verified={!!period.economy?.employees?.metadata?.verifiedBy}
            originalVerified={!!period.economy?.employees?.metadata?.verifiedBy}
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
      <CompanyEditRow
        key={"employees-unit"}
        name={t("companyEditPage.rowName.unit")}
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            name={`employees-unit-${period.id}`}
            type="text"
            key={`employees-unit-${period.id}`}
            displayAddition="verification"
            value={
              period.economy?.employees?.unit === undefined ||
              period.economy?.employees?.unit === null
                ? ""
                : period.economy?.employees?.unit
            }
            verified={!!period.economy?.employees?.metadata?.verifiedBy}
            originalVerified={!!period.economy?.employees?.metadata?.verifiedBy}
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
    </>
  );
}
