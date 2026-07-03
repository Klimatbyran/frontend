/** Skeleton that mirrors the two-row overview page layout while data loads. */
export function OverviewPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* KPI chip selector row */}
      <div className="flex gap-2 flex-wrap">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-9 bg-black-1 rounded-full"
            style={{ width: `${80 + i * 18}px` }}
          />
        ))}
      </div>

      {/* Row 1: map/graph (left) + stats panel (right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[680px] bg-black-1 rounded-level-2" />
        <div className="h-[680px] bg-black-1 rounded-level-2 p-8 flex flex-col justify-between">
          {/* Title + description */}
          <div className="space-y-3">
            <div className="h-8 w-3/4 bg-black-2 rounded" />
            <div className="h-4 w-full bg-black-2 rounded" />
            <div className="h-4 w-5/6 bg-black-2 rounded" />
            <div className="h-7 w-32 bg-black-2 rounded-full" />
          </div>
          {/* Best/worst cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-black-2 rounded-2xl" />
            <div className="h-20 bg-black-2 rounded-2xl" />
          </div>
          {/* Average card */}
          <div className="h-20 bg-black-2 rounded-2xl" />
          {/* Distribution bar */}
          <div className="space-y-3">
            <div className="h-3 w-full bg-black-2 rounded-full" />
            <div className="h-4 w-full bg-black-2 rounded" />
            <div className="h-4 w-full bg-black-2 rounded" />
          </div>
          {/* Source */}
          <div className="h-3 w-2/3 bg-black-2 rounded" />
        </div>
      </div>

      {/* Row 2: top | bottom | distribution (numeric KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-black-1 rounded-level-2 p-6 space-y-3">
            <div className="h-5 w-2/3 bg-black-2 rounded" />
            {[...Array(7)].map((_, j) => (
              <div key={j} className="h-9 bg-black-2 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
