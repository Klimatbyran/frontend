import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField } from "./CompanyEditField";
import { useTranslation } from "react-i18next";
import type { ReportingPeriod } from "@/types/company";

interface CompanyEditStatedTotalProps {
  periods: ReportingPeriod[];
  onInputChange: (name: string, value: string) => void;
  formData: Map<string, string>;
}

export function CompanyEditStatedTotal({
  periods,
  onInputChange,
  formData,
}: CompanyEditStatedTotalProps) {
  const { t } = useTranslation();

  return (
    <CompanyEditRow
      headerName
      name={t("companyEditPage.rowName.statedTotalEmissions")}
      key={"stated-total"}
    >
      {periods.map((period: ReportingPeriod) => (
        <CompanyEditInputField
          name={`stated-total-${period.id}`}
          type="number"
          key={`stated-total-${period.id}`}
          displayAddition="verification"
          value={
            period.emissions?.statedTotalEmissions?.total === undefined ||
            period.emissions?.statedTotalEmissions?.total === null
              ? ""
              : period.emissions?.statedTotalEmissions?.total
          }
          verified={
            !!period.emissions?.statedTotalEmissions?.metadata?.verifiedBy
          }
          originalVerified={
            !!period.emissions?.statedTotalEmissions?.metadata?.verifiedBy
          }
          onInputChange={onInputChange}
          formData={formData}
        />
      ))}
    </CompanyEditRow>
  );
}
