import { useTranslation } from "react-i18next";
import { getNumericValue } from "@/utils/ui/form";
import { isVerified } from "@/utils/business/verification";
import type {
  CompanyEditComponentProps,
  EditableReportingPeriod,
} from "@/types/company";
import { CompanyEditInputField } from "./CompanyEditField";
import { CompanyEditRow } from "./CompanyEditRow";

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
      {periods.map((period: EditableReportingPeriod) => (
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
