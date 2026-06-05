import type { ComparisonEntityVariant } from "@/utils/explore/comparisonUtils";

type ComparisonCopyBase =
  | "pickerTitle"
  | "pickerPlaceholder"
  | "pickerEmpty"
  | "pickerLoading"
  | "addEntity";

export function getComparisonCopyKey(
  base: ComparisonCopyBase,
  entityVariant?: ComparisonEntityVariant | null,
): string {
  if (entityVariant) {
    return `explorePage.comparison.${base}.${entityVariant}`;
  }
  return `explorePage.comparison.${base}.default`;
}
