import type { Emissions } from "@/types/company";

// Helper to normalize subfields with a 'total' property
function normalizeTotalField<T extends { total?: number | null }>(
  field: T | null | undefined,
): T | null {
  if (!field || field.total == null) return null;
  return { ...field, total: field.total as number };
}

export function cleanEmissions(emissions: any): Emissions | null {
  if (!emissions) return null;

  // Normalize all subfields up front
  const scope1 = normalizeTotalField(emissions.scope1);
  const scope1And2 = normalizeTotalField(emissions.scope1And2);
  const biogenicEmissions = normalizeTotalField(emissions.biogenicEmissions);
  const statedTotalEmissions = normalizeTotalField(
    emissions.statedTotalEmissions,
  );

  // Scope2: check calculatedTotalEmissions
  let scope2 = emissions.scope2 ?? null;
  if (!scope2 || scope2.calculatedTotalEmissions == null) {
    scope2 = null;
  } else {
    scope2 = {
      ...scope2,
      calculatedTotalEmissions: scope2.calculatedTotalEmissions as number,
    };
  }

  // Scope3: handle nested fields
  let scope3 = emissions.scope3 ?? null;
  if (!scope3) {
    scope3 = null;
  } else {
    // statedTotalEmissions in scope3
    const scope3Stated = normalizeTotalField(scope3.statedTotalEmissions);
    // categories: filter and cast
    let categories = Array.isArray(scope3.categories)
      ? scope3.categories
          .filter((cat: any) => cat && cat.total != null)
          .map((cat: any) => ({ ...cat, total: cat.total as number }))
      : undefined;
    if (categories && categories.length === 0) categories = undefined;

    scope3 = {
      ...scope3,
      statedTotalEmissions: scope3Stated,
      categories,
    };
  }

  // Return the cleaned object, ensuring all fields are present and never undefined
  return {
    id: emissions.id,
    calculatedTotalEmissions: emissions.calculatedTotalEmissions ?? 0,
    scope1,
    scope2,
    scope3,
    scope1And2,
    biogenicEmissions,
    statedTotalEmissions,
  };
}
