import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField } from "./CompanyEditField";
import { getNumericValue } from "@/utils/ui/form";
import { isVerified } from "@/utils/business/verification";
import { useTranslation } from "react-i18next";
import type {
  CompanyEditComponentProps,
  ReportingPeriod,
} from "@/types/company";

export function CompanyEditStatedTotal({
  periods,
  onInputChange,
  formData,
}: CompanyEditComponentProps) {
  const { t } = useTranslation();

  return (
    <CompanyEditRow
      headerName
      name={t("companyEditPage.rowName.statedTotalEmissions")}
      key="stated-total"
    >
      {periods.map((period: ReportingPeriod) => (
        <CompanyEditInputField
          name={`stated-total-${period.id}`}
          type="number"
          key={`stated-total-${period.id}`}
          displayAddition="verification"
          value={getNumericValue(period.emissions?.statedTotalEmissions?.total)}
          verified={isVerified(
            period.emissions?.statedTotalEmissions?.metadata,
          )}
          originalVerified={isVerified(
            period.emissions?.statedTotalEmissions?.metadata,
          )}
          onInputChange={onInputChange}
          formData={formData}
        />
      ))}
    </CompanyEditRow>
  );
}
