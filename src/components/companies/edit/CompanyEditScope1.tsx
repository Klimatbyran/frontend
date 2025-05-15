import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField } from "./CompanyEditField";

export function CompanyEditScope1({ periods, onInputChange, formData }) {
  return (
    <CompanyEditRow
      headerName
      name="Scope 1"
      key={"scope-1"}
    >
      {periods.map((period) =>
        <CompanyEditInputField
          name={`scope-1-${period.id}`}
          type="number"
          key={`scope-1-${period.id}`}
          displayAddition="verification"
          value={period.emissions.scope1?.total ?? ''}
          verified={period.emissions?.scope1?.metadata?.verifiedBy}
          onInputChange={onInputChange}
          formData={formData}
        />
      )}
    </CompanyEditRow>
  );
}
