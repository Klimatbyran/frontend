/**
 * Klimatkollen climate-plan card / KPI status text.
 * - Year set → "Antagen {year}"
 * - Link but no year → plan exists without adopted year (not "missing")
 * - No link → missing plan
 */
export function climatePlanStatusLabel(opts: {
  year: number | null | undefined;
  link: string | null | undefined;
  adopted: (year: number) => string;
  noYear: string;
  missing: string;
}): string {
  if (opts.year != null) return opts.adopted(opts.year);
  const hasLink = Boolean(
    opts.link?.trim() && opts.link.trim() !== "Saknar plan",
  );
  if (hasLink) return opts.noYear;
  return opts.missing;
}

export function climatePlanStatusTone(
  year: number | null | undefined,
  link: string | null | undefined,
): "adopted" | "noYear" | "missing" {
  if (year != null) return "adopted";
  const hasLink = Boolean(link?.trim() && link.trim() !== "Saknar plan");
  if (hasLink) return "noYear";
  return "missing";
}
