import { useMemo, useState } from "react";
import type { CompanyWithKPIs } from "@/types/company";
import { t } from "i18next";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";

type Mode = "beeswarm" | "heatgrid";

interface TrendSlopeVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

export function TrendSlopeVisualization({
  companies,
  onCompanyClick,
}: TrendSlopeVisualizationProps) {
  const [mode, setMode] = useState<Mode>("beeswarm");
  const sectorNames = useSectorNames();

  const { withTrend, noTrend } = useMemo(() => {
    const valid: CompanyWithKPIs[] = [];
    const invalid: CompanyWithKPIs[] = [];
    for (const c of companies) {
      if (typeof c.trendSlope === "number" && Number.isFinite(c.trendSlope)) {
        valid.push(c);
      } else {
        invalid.push(c);
      }
    }
    return { withTrend: valid, noTrend: invalid };
  }, [companies]);

  const values = useMemo(
    () => withTrend.map((c) => c.trendSlope as number),
    [withTrend],
  );

  const min = useMemo(
    () => (values.length ? Math.min(...values) : 0),
    [values],
  );
  const max = useMemo(
    () => (values.length ? Math.max(...values) : 0),
    [values],
  );

  const industries = useMemo(() => {
    // Group by sector name (using translated sector names)
    const map = new Map<string, CompanyWithKPIs[]>();
    for (const c of withTrend) {
      const sectorCode = (c as any).industry?.industryGics?.sectorCode;
      const sectorName =
        sectorCode && sectorCode in sectorNames
          ? sectorNames[sectorCode as keyof typeof sectorNames]
          : c.industry?.industryGics?.sv?.sectorName ||
            c.industry?.industryGics?.en?.sectorName ||
            t("companies.overview.unknownSector", "Unknown Sector");
      const key = sectorName;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries()).map(([key, comps]) => ({ key, comps }));
  }, [withTrend, sectorNames, t]);

  const bins = useMemo(() => {
    const edges = [-20, -10, -5, 0, 5, 10, 20, 50, 100];
    const labeled: { label: string; start: number; end: number }[] = [];
    const allEdges = [
      Number.NEGATIVE_INFINITY,
      ...edges,
      Number.POSITIVE_INFINITY,
    ];
    for (let i = 0; i < allEdges.length - 1; i++) {
      const a = allEdges[i];
      const b = allEdges[i + 1];
      let label = "";
      if (!Number.isFinite(a)) label = `<${b}%`;
      else if (!Number.isFinite(b)) label = `>${a}%`;
      else label = `${a}–${b}%`;
      labeled.push({ label, start: a, end: b });
    }
    return labeled;
  }, []);

  const counts = useMemo(() => {
    return bins.map((bin) => ({
      bin,
      items: withTrend.filter(
        (c) =>
          (c.trendSlope as number) >= bin.start &&
          (c.trendSlope as number) < bin.end,
      ),
    }));
  }, [bins, withTrend]);

  const maxCount = useMemo(
    () => (counts.length ? Math.max(...counts.map((c) => c.items.length)) : 0),
    [counts],
  );

  // Color function matching MeetsParisVisualization: blue (negative/good) → pink (positive/bad)
  // Center the gradient around 0, with negative = blue, positive = pink
  const colorForValue = (value: number): string => {
    // Determine the symmetric range around 0 for color mapping
    const absMax = Math.max(Math.abs(min), Math.abs(max));
    const capped = Math.max(-absMax, Math.min(absMax, value));
    // Normalize: -absMax -> 0, 0 -> 0.5, +absMax -> 1
    const normalized = absMax > 0 ? (capped + absMax) / (2 * absMax) : 0.5;

    // Map to blue-to-pink gradient (same as meetsParis)
    if (normalized <= 0.33) {
      const t = normalized / 0.33;
      return `color-mix(in srgb, var(--blue-5) ${(1 - t) * 100}%, var(--blue-4) ${t * 100}%)`;
    } else if (normalized <= 0.5) {
      const t = (normalized - 0.33) / 0.17;
      return `color-mix(in srgb, var(--blue-4) ${(1 - t) * 100}%, var(--blue-3) ${t * 100}%)`;
    } else if (normalized <= 0.67) {
      const t = (normalized - 0.5) / 0.17;
      return `color-mix(in srgb, var(--blue-3) ${(1 - t) * 100}%, var(--pink-3) ${t * 100}%)`;
    } else {
      const t = (normalized - 0.67) / 0.33;
      return `color-mix(in srgb, var(--pink-3) ${(1 - t) * 100}%, var(--pink-5) ${t * 100}%)`;
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(
            [
              ["beeswarm", "Beeswarm"],
              ["heatgrid", "Heat Grid"],
            ] as [Mode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-level-1 border transition-colors ${
                mode === m
                  ? "bg-black-3 border-black-4 text-white"
                  : "bg-black-2 border-black-3 text-grey hover:bg-black-2/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="text-sm text-grey">
          {t("companies.list.kpis.trendSlope.label", "Emissions Trend (slope)")}
          {" · "}
          {t("companies.list.kpis.meetsParis.nullValues", "Unknown")}:{" "}
          {noTrend.length}
        </div>
      </div>

      <div className="relative flex-1 bg-black-2 rounded-level-2 p-4 overflow-auto">
        {mode === "beeswarm" && (
          <div className="relative w-full h-[500px] flex flex-col">
            {/* X-axis labels */}
            <div className="flex justify-between mb-2 text-xs text-grey px-1">
              <span>{min.toFixed(1)}%/yr</span>
              <span className="font-medium">0%/yr</span>
              <span>{max.toFixed(1)}%/yr</span>
            </div>

            {/* Main visualization area */}
            <div className="relative flex-1 border-t border-b border-black-4">
              {/* Zero line (vertical) - only show if 0 is within data range */}
              {min <= 0 && max >= 0 && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-black-4 z-0"
                  style={{
                    left:
                      max === min
                        ? "50%"
                        : `${((0 - min) / (max - min)) * 100}%`,
                  }}
                />
              )}

              {/* Dots */}
              <div className="relative w-full h-full">
                {withTrend.slice(0, 600).map((c, i) => {
                  const v = c.trendSlope as number;
                  const xPercent =
                    max === min ? 50 : ((v - min) / (max - min)) * 100;
                  // Better jitter: spread dots vertically around their X position
                  // Use a hash of the index for consistent positioning
                  const hash = (i * 137.5) % 360;
                  const yJitter = Math.sin((hash * Math.PI) / 180) * 180; // -180 to +180px from center
                  const spread = Math.min(Math.abs(yJitter) / 10, 40); // Limit spread to 40px max
                  const yOffset = yJitter > 0 ? spread : -spread;

                  return (
                    <div
                      key={c.wikidataId}
                      title={`${c.name}: ${v.toFixed(1)}%/yr`}
                      onClick={() => onCompanyClick?.(c)}
                      className="absolute rounded-full cursor-pointer hover:scale-150 transition-transform z-10"
                      style={{
                        left: `calc(${xPercent}% - 8px)`,
                        top: `calc(50% + ${yOffset}px)`,
                        width: "16px",
                        height: "16px",
                        background: colorForValue(v),
                        border: "2px solid var(--black-4)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-2 text-xs text-grey text-center">
              {withTrend.length} companies shown
              {withTrend.length >= 600 && ` (showing first 600)`}
            </div>
          </div>
        )}

        {mode === "heatgrid" && (
          <div className="overflow-auto">
            {industries.length === 1 ? (
              // Single industry: show as horizontal bars (more visually useful)
              <div className="flex flex-col gap-2">
                <div className="mb-2 text-sm text-grey">
                  {industries[0].key} ({industries[0].comps.length} companies)
                </div>
                {bins.map((bin) => {
                  const items = industries[0].comps.filter(
                    (c) =>
                      (c.trendSlope as number) >= bin.start &&
                      (c.trendSlope as number) < bin.end,
                  );
                  const avg = items.length
                    ? items.reduce((a, c) => a + (c.trendSlope as number), 0) /
                      items.length
                    : 0;
                  const total = industries[0].comps.length || 1;
                  return (
                    <div key={bin.label} className="flex items-center gap-3">
                      <div className="w-28 shrink-0 text-xs text-grey">
                        {bin.label}
                      </div>
                      <div className="flex-1 h-8 bg-black-3 rounded-level-1 overflow-hidden relative">
                        <div
                          className="h-full flex items-center justify-center text-xs text-white font-medium"
                          style={{
                            width: `${(items.length / total) * 100}%`,
                            background: items.length
                              ? colorForValue(avg)
                              : "transparent",
                            minWidth: items.length ? "40px" : "0",
                          }}
                          title={`${bin.label}: ${items.length} companies (avg: ${avg.toFixed(1)}%/yr)`}
                        >
                          {items.length > 0 && `${items.length}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Multiple industries: show as grid
              <div className="min-w-[640px]">
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `160px repeat(${bins.length}, 1fr)`,
                  }}
                >
                  <div className="sticky left-0 bg-black-2" />
                  {bins.map((b) => (
                    <div
                      key={b.label}
                      className="text-xs text-grey text-center pb-2"
                    >
                      {b.label}
                    </div>
                  ))}
                  {industries.map(({ key, comps }) => (
                    <>
                      <div
                        key={`${key}-label`}
                        className="text-xs text-grey pr-2 py-1 sticky left-0 bg-black-2"
                      >
                        {key}
                      </div>
                      {bins.map((bin) => {
                        const items = comps.filter(
                          (c) =>
                            (c.trendSlope as number) >= bin.start &&
                            (c.trendSlope as number) < bin.end,
                        );
                        const avg = items.length
                          ? items.reduce(
                              (a, c) => a + (c.trendSlope as number),
                              0,
                            ) / items.length
                          : 0;
                        return (
                          <div
                            key={`${key}-${bin.label}`}
                            className="h-6 m-[2px] rounded-[3px]"
                            title={`${key} • ${bin.label}: ${items.length}`}
                            style={{
                              background: items.length
                                ? colorForValue(avg)
                                : "var(--black-3)",
                            }}
                          />
                        );
                      })}
                    </>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
