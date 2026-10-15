/**
 * Order a Paris track status.
 * On track and off track stay above missing data in both directions.
 * Descending puts on track first; ascending puts off track first.
 */
export function compareParisTrack(
  a: boolean | null | undefined,
  b: boolean | null | undefined,
  direction: "asc" | "desc",
): number {
  const rank = (value: boolean | null | undefined): number | null => {
    if (value === true) return 1;
    if (value === false) return 0;
    return null;
  };

  const aRank = rank(a);
  const bRank = rank(b);
  if (aRank == null && bRank == null) return 0;
  if (aRank == null) return 1;
  if (bRank == null) return -1;
  return direction === "desc" ? bRank - aRank : aRank - bRank;
}
