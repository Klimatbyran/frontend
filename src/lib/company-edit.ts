import type { ReportingPeriod } from "@/types/company";

export function mapCompanyEditFormToRequestBody(
  selectedPeriods: ReportingPeriod[],
  formData: Map<string, string>,
) {
  const formKeys = Array.from(formData.keys());
  const periodsUpdate = [];
  for (const period of selectedPeriods) {
    const periodUpdate: any = {
      id: period.id,
    };
    if (formData.has("start-date-" + period.id)) {
      periodUpdate.startDate =
        formData.get("start-date-" + period.id) ?? period.startDate;
    } else {
      periodUpdate.startDate = period.startDate;
    }
    if (formData.has("end-date-" + period.id)) {
      periodUpdate.endDate =
        formData.get("end-date-" + period.id) ?? period.endDate;
    } else {
      periodUpdate.endDate = period.endDate;
    }
    periodUpdate.emissions = {};

    // --- Scope 1 logic ---
    const scope1ValueKey = "scope-1-" + period.id;
    const scope1CheckboxKey = scope1ValueKey + "-checkbox";
    const originalScope1 = period.emissions?.scope1;
    const scope1ValueChanged = formData.has(scope1ValueKey);
    const scope1VerifiedChanged = formData.has(scope1CheckboxKey);
    const scope1NewVerified = scope1VerifiedChanged
      ? formData.get(scope1CheckboxKey) === "true"
      : undefined;

    if (scope1ValueChanged) {
      const val = formData.get(scope1ValueKey);
      periodUpdate.emissions.scope1 = {
        total: val === "" ? null : parseInt(val!),
        verified: scope1NewVerified ?? false,
      };
    } else if (
      scope1VerifiedChanged &&
      originalScope1 &&
      originalScope1.total !== null &&
      originalScope1.total !== undefined
    ) {
      periodUpdate.emissions.scope1 = {
        verified: scope1NewVerified,
      };
    }

    // --- Scope 2 logic ---
    if (
      formData.has("scope-2-mb-" + period.id) ||
      formData.has("scope-2-lb-" + period.id) ||
      formData.has("scope-2-unknown-" + period.id) ||
      formData.has("scope-2-unknown-" + period.id + "-checkbox") ||
      formData.has("scope-2-lb-" + period.id + "-checkbox") ||
      formData.has("scope-2-mb-" + period.id + "-checkbox")
    ) {
      periodUpdate.emissions.scope2 = {};
    }

    if (formData.has("scope-2-mb-" + period.id)) {
      const val = formData.get("scope-2-mb-" + period.id);
      periodUpdate.emissions.scope2.mb = val === "" ? null : parseInt(val!);
    }
    if (formData.has("scope-2-lb-" + period.id)) {
      const val = formData.get("scope-2-lb-" + period.id);
      periodUpdate.emissions.scope2.lb = val === "" ? null : parseInt(val!);
    }
    if (formData.has("scope-2-unknown-" + period.id)) {
      const val = formData.get("scope-2-unknown-" + period.id);
      periodUpdate.emissions.scope2.unknown =
        val === "" ? null : parseInt(val!);
    }

    if (
      formData.has("scope-2-unknown-" + period.id + "-checkbox") ||
      formData.has("scope-2-lb-" + period.id + "-checkbox") ||
      formData.has("scope-2-mb-" + period.id + "-checkbox")
    ) {
      periodUpdate.emissions.scope2.verified =
        formData.get("scope-2-unknown-" + period.id + "-checkbox") === "true" ||
        formData.get("scope-2-lb-" + period.id + "-checkbox") === "true" ||
        formData.get("scope-2-mb-" + period.id + "-checkbox") === "true";
    }

    // --- Scope 3 logic ---
    const changedCategoryIds = new Set<string>();
    for (const formKey of formKeys) {
      if (
        formKey.startsWith("scope-3-" + period.id + "-") &&
        !formKey.includes("statedTotalEmissions")
      ) {
        const parts = formKey.split("-");
        const categoryId = parts[3];
        if (categoryId) changedCategoryIds.add(categoryId);
      }
    }
    if (changedCategoryIds.size > 0) {
      if (!periodUpdate.emissions.scope3) {
        periodUpdate.emissions.scope3 = {};
      }
      periodUpdate.emissions.scope3.categories = [];
      for (const categoryId of changedCategoryIds) {
        const valueKey = `scope-3-${period.id}-${categoryId}`;
        const checkboxKey = `scope-3-${period.id}-${categoryId}-checkbox`;
        const originalCategory = period.emissions?.scope3?.categories?.find(
          (c) => String(c.category) === String(categoryId),
        );
        const valueChanged = formData.has(valueKey);
        const verifiedChanged = formData.has(checkboxKey);
        const newValue = valueChanged ? formData.get(valueKey) : undefined;
        const newVerified = verifiedChanged
          ? formData.get(checkboxKey) === "true"
          : undefined;
        const originalValue = originalCategory?.total;
        // If original value is not null/undefined and only verified is changed
        if (
          originalValue !== null &&
          originalValue !== undefined &&
          !valueChanged &&
          verifiedChanged
        ) {
          periodUpdate.emissions.scope3.categories.push({
            category: parseInt(categoryId),
            verified: newVerified,
          });
        }
        // If value is changed (from null or to a new value)
        else if (valueChanged) {
          const obj: any = {
            category: parseInt(categoryId),
            total: newValue === "" ? null : parseInt(newValue!),
          };
          if (verifiedChanged) obj.verified = newVerified;
          periodUpdate.emissions.scope3.categories.push(obj);
        }
        // If both value and verified are changed, the above covers it in one object
      }
    }

    // --- Scope 3 statedTotalEmissions logic ---
    const statedTotalValueKey = `scope-3-statedTotalEmissions-${period.id}`;
    const statedTotalCheckboxKey = statedTotalValueKey + "-checkbox";
    const originalStatedTotal = period.emissions?.scope3?.statedTotalEmissions;
    const statedTotalValueChanged = formData.has(statedTotalValueKey);
    const statedTotalVerifiedChanged = formData.has(statedTotalCheckboxKey);
    const statedTotalNewVerified = statedTotalVerifiedChanged
      ? formData.get(statedTotalCheckboxKey) === "true"
      : undefined;
    if (statedTotalValueChanged) {
      if (periodUpdate.emissions.scope3 === undefined) {
        periodUpdate.emissions.scope3 = {};
      }
      const val = formData.get(statedTotalValueKey);
      periodUpdate.emissions.scope3.statedTotalEmissions = {
        total: val === "" ? null : parseInt(val!),
        verified: statedTotalNewVerified ?? false,
      };
    } else if (
      statedTotalVerifiedChanged &&
      originalStatedTotal &&
      originalStatedTotal.total !== null &&
      originalStatedTotal.total !== undefined
    ) {
      if (periodUpdate.emissions.scope3 === undefined) {
        periodUpdate.emissions.scope3 = {};
      }
      periodUpdate.emissions.scope3.statedTotalEmissions = {
        verified: statedTotalNewVerified,
      };
    }

    // Only add emissions if not empty
    if (Object.keys(periodUpdate.emissions).length > 0) {
      periodsUpdate.push(periodUpdate);
    }
  }
  const metadata: {
    comment?: string;
    source?: string;
  } = {};

  if (formData.get("comment")) {
    metadata.comment = formData.get("comment");
  }

  if (formData.get("source")) {
    metadata.source = formData.get("source");
  }
  return {
    reportingPeriods: periodsUpdate,
    metadata,
  };
}
