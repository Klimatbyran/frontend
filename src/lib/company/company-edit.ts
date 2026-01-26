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

    // --- Report URL logic ---
    if (formData.has("report-url-" + period.id)) {
      periodUpdate.reportURL = formData.get("report-url-" + period.id) || null;
    } else {
      periodUpdate.reportURL = period.reportURL;
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
    const isVerified = originalScope1?.metadata?.verifiedBy?.name
      ? true
      : false;

    if (scope1ValueChanged) {
      const val = formData.get(scope1ValueKey);
      periodUpdate.emissions.scope1 = {
        total: val === "" ? null : parseFloat(val!),
        verified: scope1NewVerified ?? isVerified,
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
    const scope2MbChanged = formData.has("scope-2-mb-" + period.id);
    const scope2LbChanged = formData.has("scope-2-lb-" + period.id);
    const scope2UnknownChanged = formData.has("scope-2-unknown-" + period.id);
    const scope2CheckboxChanged =
      formData.has("scope-2-unknown-" + period.id + "-checkbox") ||
      formData.has("scope-2-lb-" + period.id + "-checkbox") ||
      formData.has("scope-2-mb-" + period.id + "-checkbox");

    if (
      scope2MbChanged ||
      scope2LbChanged ||
      scope2UnknownChanged ||
      scope2CheckboxChanged
    ) {
      periodUpdate.emissions.scope2 = {};

      if (scope2MbChanged) {
        const val = formData.get("scope-2-mb-" + period.id);
        periodUpdate.emissions.scope2.mb = val === "" ? null : parseFloat(val!);
      }
      if (scope2LbChanged) {
        const val = formData.get("scope-2-lb-" + period.id);
        periodUpdate.emissions.scope2.lb = val === "" ? null : parseFloat(val!);
      }
      if (scope2UnknownChanged) {
        const val = formData.get("scope-2-unknown-" + period.id);
        periodUpdate.emissions.scope2.unknown =
          val === "" ? null : parseFloat(val!);
      }

      const originalScope2IsVerified =
        !!period.emissions?.scope2?.metadata?.verifiedBy?.name;
      if (scope2CheckboxChanged) {
        periodUpdate.emissions.scope2.verified =
          formData.get("scope-2-unknown-" + period.id + "-checkbox") ===
            "true" ||
          formData.get("scope-2-lb-" + period.id + "-checkbox") === "true" ||
          formData.get("scope-2-mb-" + period.id + "-checkbox") === "true";
      } else {
        // Preserve previous verification if only values changed
        periodUpdate.emissions.scope2.verified = originalScope2IsVerified;
      }
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
            total: newValue === "" ? null : parseFloat(newValue!),
          };
          // Only include verified if it was explicitly changed
          if (verifiedChanged) {
            obj.verified = newVerified;
          }
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
        total: val === "" ? null : parseFloat(val!),
        verified:
          statedTotalNewVerified ??
          !!originalStatedTotal?.metadata?.verifiedBy?.name,
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

    // --- Stated Total Emissions logic (at emissions level) ---
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
      ? formData.get(emissionsStatedTotalCheckboxKey) === "true"
      : undefined;

    if (emissionsStatedTotalValueChanged) {
      const val = formData.get(emissionsStatedTotalValueKey);
      periodUpdate.emissions.statedTotalEmissions = {
        total: val === "" ? null : parseFloat(val!),
        verified:
          emissionsStatedTotalNewVerified ??
          !!originalEmissionsStatedTotal?.metadata?.verifiedBy?.name,
      };
    } else if (
      emissionsStatedTotalVerifiedChanged &&
      originalEmissionsStatedTotal &&
      originalEmissionsStatedTotal.total !== null &&
      originalEmissionsStatedTotal.total !== undefined
    ) {
      periodUpdate.emissions.statedTotalEmissions = {
        verified: emissionsStatedTotalNewVerified,
      };
    }

    // --- Scope 1 & 2 Combined logic ---
    const scope1And2ValueKey = `scope-1-and-2-${period.id}`;
    const scope1And2CheckboxKey = scope1And2ValueKey + "-checkbox";
    const originalScope1And2 = period.emissions?.scope1And2;
    const scope1And2ValueChanged = formData.has(scope1And2ValueKey);
    const scope1And2VerifiedChanged = formData.has(scope1And2CheckboxKey);
    const scope1And2NewVerified = scope1And2VerifiedChanged
      ? formData.get(scope1And2CheckboxKey) === "true"
      : undefined;

    if (scope1And2ValueChanged) {
      const val = formData.get(scope1And2ValueKey);
      periodUpdate.emissions.scope1And2 = {
        total: val === "" ? null : parseFloat(val!),
        verified:
          scope1And2NewVerified ??
          !!originalScope1And2?.metadata?.verifiedBy?.name,
      };
    } else if (
      scope1And2VerifiedChanged &&
      originalScope1And2 &&
      originalScope1And2.total !== null &&
      originalScope1And2.total !== undefined
    ) {
      periodUpdate.emissions.scope1And2 = {
        verified: scope1And2NewVerified,
      };
    }

    // --- Economy logic ---
    periodUpdate.economy = {};

    // --- Turnover logic ---
    const turnoverValueKey = `turnover-value-${period.id}`;
    const turnoverCurrencyKey = `turnover-currency-${period.id}`;
    const turnoverCheckboxKey = turnoverValueKey + "-checkbox";
    const originalTurnover = period.economy?.turnover;
    const turnoverValueChanged = formData.has(turnoverValueKey);
    const turnoverCurrencyChanged = formData.has(turnoverCurrencyKey);
    const turnoverVerifiedChanged = formData.has(turnoverCheckboxKey);
    const turnoverNewVerified = turnoverVerifiedChanged
      ? formData.get(turnoverCheckboxKey) === "true"
      : undefined;

    if (turnoverValueChanged || turnoverCurrencyChanged) {
      periodUpdate.economy.turnover = {
        value: turnoverValueChanged
          ? formData.get(turnoverValueKey) === ""
            ? undefined
            : parseFloat(formData.get(turnoverValueKey)!)
          : originalTurnover?.value,
        currency: turnoverCurrencyChanged
          ? formData.get(turnoverCurrencyKey) === ""
            ? undefined
            : formData.get(turnoverCurrencyKey)
          : originalTurnover?.currency,
        verified:
          turnoverNewVerified ?? !!originalTurnover?.metadata?.verifiedBy?.name,
      };
    } else if (turnoverVerifiedChanged && originalTurnover) {
      periodUpdate.economy.turnover = {
        verified: turnoverNewVerified,
      };
    }

    // --- Employees logic ---
    const employeesValueKey = `employees-value-${period.id}`;
    const employeesUnitKey = `employees-unit-${period.id}`;
    const employeesCheckboxKey = employeesValueKey + "-checkbox";
    const originalEmployees = period.economy?.employees;
    const employeesValueChanged = formData.has(employeesValueKey);
    const employeesUnitChanged = formData.has(employeesUnitKey);
    const employeesVerifiedChanged = formData.has(employeesCheckboxKey);
    const employeesNewVerified = employeesVerifiedChanged
      ? formData.get(employeesCheckboxKey) === "true"
      : undefined;

    if (employeesValueChanged || employeesUnitChanged) {
      periodUpdate.economy.employees = {
        value: employeesValueChanged
          ? formData.get(employeesValueKey) === ""
            ? undefined
            : parseFloat(formData.get(employeesValueKey)!)
          : originalEmployees?.value,
        unit: employeesUnitChanged
          ? formData.get(employeesUnitKey) === ""
            ? undefined
            : formData.get(employeesUnitKey)
          : originalEmployees?.unit,
        verified:
          employeesNewVerified ??
          !!originalEmployees?.metadata?.verifiedBy?.name,
      };
    } else if (employeesVerifiedChanged && originalEmployees) {
      periodUpdate.economy.employees = {
        verified: employeesNewVerified,
      };
    }

    // Check if there are any changes to include
    const hasEmissionsChanges = Object.keys(periodUpdate.emissions).length > 0;
    const hasEconomyChanges =
      Object.keys(periodUpdate.economy || {}).length > 0;
    const hasPeriodChanges =
      periodUpdate.startDate !== period.startDate ||
      periodUpdate.endDate !== period.endDate ||
      periodUpdate.reportURL !== period.reportURL;

    if (hasEmissionsChanges || hasEconomyChanges || hasPeriodChanges) {
      // Create the final update object
      // startDate and endDate are required by the API, so always include them
      const finalUpdate: any = {
        id: period.id,
        startDate: periodUpdate.startDate,
        endDate: periodUpdate.endDate,
      };

      // reportURL is optional, only include if it changed
      if (periodUpdate.reportURL !== period.reportURL) {
        finalUpdate.reportURL = periodUpdate.reportURL;
      }

      if (hasEmissionsChanges) {
        finalUpdate.emissions = periodUpdate.emissions;
      }

      if (hasEconomyChanges) {
        finalUpdate.economy = periodUpdate.economy;
      }

      periodsUpdate.push(finalUpdate);
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
