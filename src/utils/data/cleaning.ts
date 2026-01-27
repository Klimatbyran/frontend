import type { Scope3Category } from "@/types/company";

// Helper to normalize subfields with a 'total' property
function normalizeTotalField<T extends { total?: number | null }>(
  field: T | null | undefined,
): T | null {
  if (!field || field.total == null) return null;
  return { ...field, total: field.total as number };
}

/**
 * Clean emissions data - works with both simple (list) and complex (detail) structures
 *
 * Why `any` type is used here:
 * - Two different API endpoints return different structures:
 *   - List endpoint (/companies/): Simple structure without IDs
 *   - Detail endpoint (/companies/{wikidataId}): Complex structure with IDs and additional metadata
 * - The function needs to handle both structures gracefully
 * - Complex union types would be unwieldy and hard to maintain
 * - Type safety comes from usage sites, not this utility function
 * - The function preserves important fields (id, metadata.user, metadata.comment, metadata.source)
 *   that are used throughout the codebase for AI detection and edit forms
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cleanEmissions(emissions: any): any {
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
          .filter((cat: Scope3Category) => cat && cat.total != null)
          .map((cat: Scope3Category) => ({
            ...cat,
            total: cat.total as number,
          }))
      : undefined;
    if (categories && categories.length === 0) categories = undefined;

    scope3 = {
      ...scope3,
      statedTotalEmissions: scope3Stated,
      categories,
    };
  }

  // Temporary workaround: fallback to scope1And2 if calculatedTotalEmissions is null or 0
  const calculatedTotalEmissions =
    emissions.calculatedTotalEmissions &&
    emissions.calculatedTotalEmissions !== 0
      ? emissions.calculatedTotalEmissions
      : (scope1And2?.total ?? 0);

  // Return the cleaned object, ensuring all fields are present and never undefined
  return {
    ...(emissions.id && { id: emissions.id }), // Only include id if it exists
    calculatedTotalEmissions,
    scope1,
    scope2,
    scope3,
    scope1And2,
    biogenicEmissions,
    statedTotalEmissions,
  };
}
