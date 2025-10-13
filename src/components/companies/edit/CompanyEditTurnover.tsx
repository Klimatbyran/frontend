import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField } from "./CompanyEditField";
import { useTranslation } from "react-i18next";
import type { ReportingPeriod } from "@/types/company";

interface CompanyEditTurnoverProps {
  periods: ReportingPeriod[];
  onInputChange: (name: string, value: string) => void;
  formData: Map<string, string>;
}

export function CompanyEditTurnover({
  periods,
  onInputChange,
  formData,
}: CompanyEditTurnoverProps) {
  const { t } = useTranslation();

  return (
    <>
      <CompanyEditRow
        key={"turnover-value"}
        name={t("companyEditPage.rowName.turnover")}
        headerName
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            name={`turnover-value-${period.id}`}
            type="number"
            key={`turnover-value-${period.id}`}
            displayAddition="verification"
            value={
              period.economy?.turnover?.value === undefined ||
              period.economy?.turnover?.value === null
                ? ""
                : period.economy?.turnover?.value
            }
            verified={!!period.economy?.turnover?.metadata?.verifiedBy}
            originalVerified={!!period.economy?.turnover?.metadata?.verifiedBy}
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
      <CompanyEditRow
        key={"turnover-currency"}
        name={t("companyEditPage.rowName.currency")}
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            name={`turnover-currency-${period.id}`}
            type="text"
            key={`turnover-currency-${period.id}`}
            displayAddition="verification"
            value={
              period.economy?.turnover?.currency === undefined ||
              period.economy?.turnover?.currency === null
                ? ""
                : period.economy?.turnover?.currency
            }
            verified={!!period.economy?.turnover?.metadata?.verifiedBy}
            originalVerified={!!period.economy?.turnover?.metadata?.verifiedBy}
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
    </>
  );
}
