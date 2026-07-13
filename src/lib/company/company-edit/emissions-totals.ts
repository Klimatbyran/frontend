import type { EditableReportingPeriod } from "@/types/company";
import { parseNullableFormNumber } from "@/utils/ui/numberFormat";
import {
  getFormValue,
  isFormCheckboxChecked,
  isOriginallyVerified,
} from "./helpers";

type EmissionsUpdate = NonNullable<
  NonNullable<import("@/types/company").ReportingPeriodPayloadItem["emissions"]>
>;

export function mapEmissionsStatedTotal(
  period: EditableReportingPeriod,
  formData: Map<string, string>,
  emissions: EmissionsUpdate,
): void {
  const emissionsStatedTotalValueKey = `stated-total-${period.id}`;
  const emissionsStatedTotalCheckboxKey =
    emissionsStatedTotalValueKey + "-checkbox";
  const originalEmissionsStatedTotal = period.emissions?.statedTotalEmissions;
  const emissionsStatedTotalValueChanged = formData.has(
    emissionsStatedTotalValueKey,
  );
  const emissionsStatedTotalVerifiedChanged = formData.has(
    emissionsStatedTotalCheckboxKey,
  );
  const emissionsStatedTotalNewVerified = emissionsStatedTotalVerifiedChanged
    ? isFormCheckboxChecked(formData, emissionsStatedTotalCheckboxKey)
    : undefined;

  if (emissionsStatedTotalValueChanged) {
    const val = getFormValue(formData, emissionsStatedTotalValueKey);
    emissions.statedTotalEmissions = {
      total: val === "" ? null : parseNullableFormNumber(val!),
      unit: originalEmissionsStatedTotal?.unit || "tCO2e",
      verified:
        emissionsStatedTotalNewVerified ??
        isOriginallyVerified(originalEmissionsStatedTotal?.metadata),
    };
  } else if (
    emissionsStatedTotalVerifiedChanged &&
    originalEmissionsStatedTotal &&
    originalEmissionsStatedTotal.total !== null &&
    originalEmissionsStatedTotal.total !== undefined
  ) {
    emissions.statedTotalEmissions = {
      total: originalEmissionsStatedTotal.total,
      unit: originalEmissionsStatedTotal.unit || "tCO2e",
      verified: emissionsStatedTotalNewVerified,
    };
  }
}

export function mapScope1And2Emissions(
  period: EditableReportingPeriod,
  formData: Map<string, string>,
  emissions: EmissionsUpdate,
): void {
  const scope1And2ValueKey = `scope-1-and-2-${period.id}`;
  const scope1And2CheckboxKey = scope1And2ValueKey + "-checkbox";
  const originalScope1And2 = period.emissions?.scope1And2;
  const scope1And2ValueChanged = formData.has(scope1And2ValueKey);
  const scope1And2VerifiedChanged = formData.has(scope1And2CheckboxKey);
  const scope1And2NewVerified = scope1And2VerifiedChanged
    ? isFormCheckboxChecked(formData, scope1And2CheckboxKey)
    : undefined;

  if (scope1And2ValueChanged) {
    const val = getFormValue(formData, scope1And2ValueKey);
    emissions.scope1And2 = {
      total: val === "" ? null : parseNullableFormNumber(val!),
      unit: originalScope1And2?.unit || "tCO2e",
      verified:
        scope1And2NewVerified ??
        isOriginallyVerified(originalScope1And2?.metadata),
    };
  } else if (
    scope1And2VerifiedChanged &&
    originalScope1And2 &&
    originalScope1And2.total !== null &&
    originalScope1And2.total !== undefined
  ) {
    emissions.scope1And2 = {
      verified: scope1And2NewVerified,
    };
  }
}
