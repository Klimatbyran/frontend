import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField } from "./CompanyEditField";
import { useTranslation } from "react-i18next";
import type { ReportingPeriod } from "@/types/company";

interface CompanyEditScope1And2Props {
  periods: ReportingPeriod[];
  onInputChange: (name: string, value: string) => void;
  formData: Map<string, string>;
}

export function CompanyEditScope1And2({
  periods,
  onInputChange,
  formData,
}: CompanyEditScope1And2Props) {
  const { t } = useTranslation();

  return (
    <CompanyEditRow
      headerName
      name={t("companyEditPage.rowName.scope1And2Combined")}
      key={"scope-1-and-2"}
    >
      {periods.map((period: ReportingPeriod) => (
        <CompanyEditInputField
          name={`scope-1-and-2-${period.id}`}
          type="number"
          key={`scope-1-and-2-${period.id}`}
          displayAddition="verification"
          value={
            period.emissions?.scope1And2?.total === undefined ||
            period.emissions?.scope1And2?.total === null
              ? ""
              : period.emissions?.scope1And2?.total
          }
          verified={!!period.emissions?.scope1And2?.metadata?.verifiedBy}
          originalVerified={
            !!period.emissions?.scope1And2?.metadata?.verifiedBy
          }
          onInputChange={onInputChange}
          formData={formData}
        />
      ))}
    </CompanyEditRow>
  );
}
