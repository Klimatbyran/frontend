import type { EditableReportingPeriod } from "@/types/company";
import { parseNullableFormNumber } from "@/utils/ui/numberFormat";
import { getFormValue, isFormCheckboxChecked } from "./helpers";

type EmissionsUpdate = NonNullable<
  NonNullable<
    import("@/types/company").ReportingPeriodPayloadItem["emissions"]
  >
>;

function hasScope2Changes(period: EditableReportingPeriod, formData: Map<string, string>): boolean {
  return (
    formData.has("scope-2-mb-" + period.id) ||
    formData.has("scope-2-lb-" + period.id) ||
    formData.has("scope-2-unknown-" + period.id) ||
    formData.has("scope-2-unknown-" + period.id + "-checkbox") ||
    formData.has("scope-2-lb-" + period.id + "-checkbox") ||
    formData.has("scope-2-mb-" + period.id + "-checkbox")
  );
}

function mapScope2Values(
  period: EditableReportingPeriod,
  formData: Map<string, string>,
  scope2: NonNullable<EmissionsUpdate["scope2"]>,
): void {
  const fields = [
    { key: "scope-2-mb-" + period.id, target: "mb" as const },
    { key: "scope-2-lb-" + period.id, target: "lb" as const },
    { key: "scope-2-unknown-" + period.id, target: "unknown" as const },
  ];

  for (const { key, target } of fields) {
    if (!formData.has(key)) continue;
    const val = getFormValue(formData, key);
    scope2[target] = val === "" ? null : parseNullableFormNumber(val!);
  }
}

function resolveScope2Verified(
  period: EditableReportingPeriod,
  formData: Map<string, string>,
): boolean {
  const checkboxChanged =
    formData.has("scope-2-unknown-" + period.id + "-checkbox") ||
    formData.has("scope-2-lb-" + period.id + "-checkbox") ||
    formData.has("scope-2-mb-" + period.id + "-checkbox");

  if (!checkboxChanged) {
    return !!period.emissions?.scope2?.metadata?.verifiedBy?.name;
  }

  return (
    isFormCheckboxChecked(
      formData,
      "scope-2-unknown-" + period.id + "-checkbox",
    ) ||
    isFormCheckboxChecked(formData, "scope-2-lb-" + period.id + "-checkbox") ||
    isFormCheckboxChecked(formData, "scope-2-mb-" + period.id + "-checkbox")
  );
}

export function mapScope2Emissions(
  period: EditableReportingPeriod,
  formData: Map<string, string>,
  emissions: EmissionsUpdate,
): void {
  if (!hasScope2Changes(period, formData)) {
    return;
  }

  emissions.scope2 = {};
  mapScope2Values(period, formData, emissions.scope2);
  emissions.scope2.verified = resolveScope2Verified(period, formData);
  emissions.scope2.unit = period.emissions?.scope2?.unit || "tCO2e";
}
