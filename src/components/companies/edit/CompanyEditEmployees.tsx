import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField } from "./CompanyEditField";
import { getNumericValue, getStringValue } from "@/utils/ui/form";
import { isVerified } from "@/utils/business/verification";
import { useTranslation } from "react-i18next";
import type {
  CompanyEditComponentProps,
  ReportingPeriod,
} from "@/types/company";

export function CompanyEditEmployees({
  periods,
  onInputChange,
  formData,
}: CompanyEditComponentProps) {
  const { t } = useTranslation();

  return (
    <>
      <CompanyEditRow
        headerName
        name={t("companyEditPage.rowName.employees")}
        key="employees-value"
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            name={`employees-value-${period.id}`}
            type="number"
            key={`employees-value-${period.id}`}
            displayAddition="verification"
            value={getNumericValue(period.economy?.employees?.value)}
            verified={isVerified(period.economy?.employees?.metadata)}
            originalVerified={isVerified(period.economy?.employees?.metadata)}
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
      <CompanyEditRow
        name={t("companyEditPage.rowName.unit")}
        key="employees-unit"
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            name={`employees-unit-${period.id}`}
            type="text"
            key={`employees-unit-${period.id}`}
            displayAddition="none"
            value={getStringValue(period.economy?.employees?.unit)}
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
    </>
  );
}
