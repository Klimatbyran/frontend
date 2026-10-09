export type OverviewPageSkeletonVariant = "municipalities" | "regions";

interface OverviewPageSkeletonProps {
  variant?: OverviewPageSkeletonVariant;
  /** Number of data chip placeholders on desktop */
  chipCount?: number;
}

const SHIMMER = "bg-white/10 rounded animate-pulse";

const CHIP_WIDTHS = ["w-20", "w-28", "w-24", "w-32", "w-28", "w-36", "w-24"];

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`${SHIMMER} ${className}`} />;
}

function DataChipSelectorSkeleton({ chipCount }: { chipCount: number }) {
  return (
    <div className="space-y-2">
      <SkeletonBlock className="mx-1 h-3 w-36" />
      <div className="flex flex-col gap-2">
        <SkeletonBlock className="h-12 w-full rounded-xl md:hidden" />
        <div className="hidden flex-wrap gap-2 md:flex">
          {Array.from({ length: chipCount }, (_, i) => (
            <SkeletonBlock
              key={i}
              className={`h-9 rounded-full ${CHIP_WIDTHS[i % CHIP_WIDTHS.length]}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AnswerCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-level-2 bg-black-2 p-6">
      <SkeletonBlock className="h-3 w-28" />
      <SkeletonBlock className="h-14 w-32" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-5/6" />
      <SkeletonBlock className="h-7 w-32 rounded-full" />
      <SkeletonBlock className="mt-2 h-16 w-full rounded-2xl" />
      <SkeletonBlock className="h-16 w-full rounded-2xl" />
      <SkeletonBlock className="h-2.5 w-full rounded-full" />
      <SkeletonBlock className="h-3 w-2/3" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-level-2 bg-black-2 p-6">
      <SkeletonBlock className="h-6 w-2/3" />
      <SkeletonBlock className="h-4 w-full" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBlock className="h-4 w-6 shrink-0" />
          <SkeletonBlock className="h-4 max-w-[45%] flex-1" />
          <SkeletonBlock className="h-4 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton that mirrors the overview page layout while data loads. */
export function OverviewPageSkeleton({
  variant = "municipalities",
  chipCount = variant === "regions" ? 2 : 7,
}: OverviewPageSkeletonProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-9 w-56 md:w-72" />
          <SkeletonBlock className="h-4 w-full max-w-xl" />
        </div>
        <DataChipSelectorSkeleton chipCount={chipCount} />
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[24rem_minmax(0,1fr)]">
          <SkeletonBlock className="min-h-[28rem] w-full rounded-level-2 lg:min-h-[40rem]" />
          <AnswerCardSkeleton />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ListSkeleton />
        <ListSkeleton />
      </div>
      <SkeletonBlock className="h-80 w-full rounded-level-2" />
    </div>
  );
}
