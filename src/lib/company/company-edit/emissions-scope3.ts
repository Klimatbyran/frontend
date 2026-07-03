import type { EditableReportingPeriod } from "@/types/company";
import { parseNullableFormNumber } from "@/utils/ui/numberFormat";
import {
  getFormValue,
  isFormCheckboxChecked,
  isOriginallyVerified,
} from "./helpers";

type EmissionsUpdate = NonNullable<
  NonNullable<
    import("@/types/company").ReportingPeriodPayloadItem["emissions"]
  >
>;

function getChangedScope3CategoryIds(
  period: EditableReportingPeriod,
  formKeys: string[],
): Set<string> {
  const changedCategoryIds = new Set<string>();
  const prefix = "scope-3-" + period.id + "-";

  for (const formKey of formKeys) {
    if (formKey.startsWith(prefix) && !formKey.includes("statedTotalEmissions")) {
      const parts = formKey.split("-");
      const categoryId = parts[3];
      if (categoryId) changedCategoryIds.add(categoryId);
    }
  }

  return changedCategoryIds;
}

function buildVerifiedOnlyCategoryUpdate(
  categoryId: string,
  originalCategory: NonNullable<
    NonNullable<
      EditableReportingPeriod["emissions"]["scope3"]
    >["categories"]
  >[number],
  originalValue: number,
  newVerified: boolean | undefined,
) {
  return {
    category: parseInt(categoryId),
    total: originalValue,
    unit: originalCategory?.unit || "tCO2e",
    verified: newVerified,
  };
}

function buildValueChangedCategoryUpdate(
  categoryId: string,
  newValue: string | undefined,
  originalCategory: NonNullable<
    NonNullable<
      EditableReportingPeriod["emissions"]["scope3"]
    >["categories"]
  >[number] | undefined,
  verifiedChanged: boolean,
  newVerified: boolean | undefined,
) {
  const obj: {
    category: number;
    total: number | null;
    unit: string;
    verified?: boolean;
  } = {
    category: parseInt(categoryId),
    total: newValue === "" ? null : parseNullableFormNumber(newValue!),
    unit: originalCategory?.unit || "tCO2e",
  };
  if (verifiedChanged) {
    obj.verified = newVerified;
  }
  return obj;
}

function mapScope3Category(
  period: EditableReportingPeriod,
  formData: Map<string, string>,
  categoryId: string,
) {
  const valueKey = `scope-3-${period.id}-${categoryId}`;
  const checkboxKey = `scope-3-${period.id}-${categoryId}-checkbox`;
  const originalCategory = period.emissions?.scope3?.categories?.find(
    (c) => String(c.category) === String(categoryId),
  );
  const valueChanged = formData.has(valueKey);
  const verifiedChanged = formData.has(checkboxKey);
  const newValue = valueChanged ? getFormValue(formData, valueKey) : undefined;
  const newVerified = verifiedChanged
    ? isFormCheckboxChecked(formData, checkboxKey)
    : undefined;
  const originalValue = originalCategory?.total;

  if (
    originalValue !== null &&
    originalValue !== undefined &&
    !valueChanged &&
    verifiedChanged &&
    originalCategory
  ) {
    return buildVerifiedOnlyCategoryUpdate(
      categoryId,
      originalCategory,
      originalValue,
      newVerified,
    );
  }

  if (!valueChanged) {
    return null;
  }

  return buildValueChangedCategoryUpdate(
    categoryId,
    newValue,
    originalCategory,
    verifiedChanged,
    newVerified,
  );
}

export function mapScope3Categories(
  period: EditableReportingPeriod,
  formData: Map<string, string>,
  formKeys: string[],
  emissions: EmissionsUpdate,
): void {
  const changedCategoryIds = getChangedScope3CategoryIds(period, formKeys);
  if (changedCategoryIds.size === 0) return;

  if (!emissions.scope3) {
    emissions.scope3 = {};
  }
  emissions.scope3.categories = [];

  for (const categoryId of changedCategoryIds) {
    const categoryUpdate = mapScope3Category(period, formData, categoryId);
    if (categoryUpdate) {
      emissions.scope3.categories.push(categoryUpdate);
    }
  }
}

function applyStatedTotalValueChange(
  formData: Map<string, string>,
  valueKey: string,
  originalStatedTotal: EditableReportingPeriod["emissions"]["scope3"]["statedTotalEmissions"],
  statedTotalNewVerified: boolean | undefined,
) {
  const val = getFormValue(formData, valueKey);
  return {
    total: val === "" ? null : parseNullableFormNumber(val!),
    unit: originalStatedTotal?.unit || "tCO2e",
    verified:
      statedTotalNewVerified ??
      isOriginallyVerified(originalStatedTotal?.metadata),
  };
}

export function mapScope3StatedTotal(
  period: EditableReportingPeriod,
  formData: Map<string, string>,
  emissions: EmissionsUpdate,
): void {
  const statedTotalValueKey = `scope-3-statedTotalEmissions-${period.id}`;
  const statedTotalCheckboxKey = statedTotalValueKey + "-checkbox";
  const originalStatedTotal = period.emissions?.scope3?.statedTotalEmissions;
  const statedTotalValueChanged = formData.has(statedTotalValueKey);
  const statedTotalVerifiedChanged = formData.has(statedTotalCheckboxKey);
  const statedTotalNewVerified = statedTotalVerifiedChanged
    ? isFormCheckboxChecked(formData, statedTotalCheckboxKey)
    : undefined;

  if (!statedTotalValueChanged && !statedTotalVerifiedChanged) {
    return;
  }

  if (emissions.scope3 === undefined) {
    emissions.scope3 = {};
  }

  if (statedTotalValueChanged) {
    emissions.scope3.statedTotalEmissions = applyStatedTotalValueChange(
      formData,
      statedTotalValueKey,
      originalStatedTotal,
      statedTotalNewVerified,
    );
    return;
  }

  if (
    originalStatedTotal &&
    originalStatedTotal.total !== null &&
    originalStatedTotal.total !== undefined
  ) {
    emissions.scope3.statedTotalEmissions = {
      total: originalStatedTotal.total,
      unit: originalStatedTotal.unit || "tCO2e",
      verified: statedTotalNewVerified,
    };
  }
}
