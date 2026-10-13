import { OverviewPageRoot } from "@/components/layout/OverviewPageRoot";

interface OverviewPageSkeletonProps {
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
    <div>
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
    <div className="flex min-h-[20rem] flex-col justify-between rounded-level-2 bg-black-2 px-6 py-8 md:px-10 md:py-9">
      <div className="space-y-3.5">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-14 w-32 md:h-16" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-7 w-32 rounded-full" />
      </div>
      <div className="space-y-4 py-6 md:py-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <SkeletonBlock className="h-20 w-full rounded-2xl" />
          <SkeletonBlock className="h-20 w-full rounded-2xl" />
        </div>
        <SkeletonBlock className="h-3 w-full rounded-full" />
      </div>
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
  chipCount = 7,
}: OverviewPageSkeletonProps) {
  return (
    <OverviewPageRoot>
      <div className="space-y-5 md:space-y-7">
        <div className="space-y-2">
          <SkeletonBlock className="h-9 w-56 md:h-11 md:w-72" />
          <SkeletonBlock className="h-4 w-full max-w-xl" />
        </div>
        <DataChipSelectorSkeleton chipCount={chipCount} />
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
          <SkeletonBlock className="h-[28rem] w-full rounded-level-2 lg:h-[calc(100dvh-13.5rem)]" />
          <AnswerCardSkeleton />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ListSkeleton />
        <ListSkeleton />
      </div>
      <SkeletonBlock className="h-80 w-full rounded-level-2" />
    </OverviewPageRoot>
  );
}
