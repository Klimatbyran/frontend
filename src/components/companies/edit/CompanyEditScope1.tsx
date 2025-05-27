import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField } from "./CompanyEditField";
import type { ReportingPeriod } from "@/types/company";

interface CompanyEditScope1Props {
  periods: ReportingPeriod[];
  onInputChange: (name: string, value: string) => void;
  formData: Map<string, string>;
}

export function CompanyEditScope1({
  periods,
  onInputChange,
  formData,
}: CompanyEditScope1Props) {
  return (
    <CompanyEditRow headerName name="Scope 1" key={"scope-1"}>
      {periods.map((period: ReportingPeriod) => (
        <CompanyEditInputField
          name={`scope-1-${period.id}`}
          type="number"
          key={`scope-1-${period.id}`}
          displayAddition="verification"
          value={
            period.emissions?.scope1?.total === undefined ||
            period.emissions?.scope1?.total === null
              ? ""
              : period.emissions?.scope1?.total
          }
          verified={!!period.emissions?.scope1?.metadata?.verifiedBy}
          originalVerified={!!period.emissions?.scope1?.metadata?.verifiedBy}
          onInputChange={onInputChange}
          formData={formData}
        />
      ))}
    </CompanyEditRow>
  );
}
