import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField } from "./CompanyEditField";
import { getNumericValue, getStringValue } from "@/utils/ui/form";
import { isVerified } from "@/utils/business/verification";
import { useTranslation } from "react-i18next";
import type {
  CompanyEditComponentProps,
  ReportingPeriod,
} from "@/types/company";

export function CompanyEditTurnover({
  periods,
  onInputChange,
  formData,
}: CompanyEditComponentProps) {
  const { t } = useTranslation();

  return (
    <>
      <CompanyEditRow
        headerName
        name={t("companyEditPage.rowName.turnover")}
        key="turnover-value"
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            name={`turnover-value-${period.id}`}
            type="number"
            key={`turnover-value-${period.id}`}
            displayAddition="verification"
            value={getNumericValue(period.economy?.turnover?.value)}
            verified={isVerified(period.economy?.turnover?.metadata)}
            originalVerified={isVerified(period.economy?.turnover?.metadata)}
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
      <CompanyEditRow
        name={t("companyEditPage.rowName.currency")}
        key="turnover-currency"
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            name={`turnover-currency-${period.id}`}
            type="text"
            key={`turnover-currency-${period.id}`}
            displayAddition="none"
            value={getStringValue(period.economy?.turnover?.currency)}
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
    </>
  );
}
