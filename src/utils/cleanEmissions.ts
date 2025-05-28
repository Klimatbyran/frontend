import type { Emissions } from "@/types/company";

export function cleanEmissions(
  emissions: Emissions | null | undefined,
): Emissions | null {
  if (!emissions) return null;

  const cleaned: Emissions = { ...emissions };

  // Normalize scope1
  if (!cleaned.scope1 || cleaned.scope1.total == null) {
    cleaned.scope1 = null;
  }

  // Normalize scope1And2
  if (!cleaned.scope1And2 || cleaned.scope1And2.total == null) {
    cleaned.scope1And2 = null;
  }

  // Normalize biogenicEmissions
  if (!cleaned.biogenicEmissions || cleaned.biogenicEmissions.total == null) {
    cleaned.biogenicEmissions = null;
  }

  // Normalize statedTotalEmissions at root
  if (
    !cleaned.statedTotalEmissions ||
    cleaned.statedTotalEmissions.total == null
  ) {
    cleaned.statedTotalEmissions = null;
  }

  // Normalize scope3
  if (!cleaned.scope3) {
    cleaned.scope3 = null;
  } else {
    // Normalize scope3.statedTotalEmissions
    if (
      !cleaned.scope3.statedTotalEmissions ||
      cleaned.scope3.statedTotalEmissions.total == null
    ) {
      cleaned.scope3.statedTotalEmissions = null;
    }
    // Normalize scope3.categories
    if (cleaned.scope3.categories) {
      cleaned.scope3.categories = cleaned.scope3.categories.filter(
        (cat) => cat && cat.total != null,
      );
      if (cleaned.scope3.categories.length === 0) {
        cleaned.scope3.categories = undefined;
      }
    } else {
      cleaned.scope3.categories = undefined;
    }
  }

  return cleaned;
}
