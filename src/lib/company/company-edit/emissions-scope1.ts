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

export function mapScope1Emissions(
  period: EditableReportingPeriod,
  formData: Map<string, string>,
  emissions: EmissionsUpdate,
): void {
  const scope1ValueKey = "scope-1-" + period.id;
  const scope1CheckboxKey = scope1ValueKey + "-checkbox";
  const originalScope1 = period.emissions?.scope1;
  const scope1ValueChanged = formData.has(scope1ValueKey);
  const scope1VerifiedChanged = formData.has(scope1CheckboxKey);
  const scope1NewVerified = scope1VerifiedChanged
    ? isFormCheckboxChecked(formData, scope1CheckboxKey)
    : undefined;
  const isVerified = isOriginallyVerified(originalScope1?.metadata);

  if (scope1ValueChanged) {
    const val = getFormValue(formData, scope1ValueKey);
    emissions.scope1 = {
      total: val === "" ? null : parseNullableFormNumber(val!),
      unit: originalScope1?.unit || "tCO2e",
      verified: scope1NewVerified ?? isVerified,
    };
  } else if (
    scope1VerifiedChanged &&
    originalScope1 &&
    originalScope1.total !== null &&
    originalScope1.total !== undefined
  ) {
    emissions.scope1 = {
      verified: scope1NewVerified,
    };
  }
}
