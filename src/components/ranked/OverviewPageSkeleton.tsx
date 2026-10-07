import {
  OVERVIEW_PANEL_HEIGHT,
  OVERVIEW_PANEL_MD_HEIGHT,
} from "@/components/ranked/overviewPanel";

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

function HeaderSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <SkeletonBlock className="h-9 w-3/4 max-w-[420px]" />
        <SkeletonBlock className="h-4 w-full max-w-[600px]" />
        <SkeletonBlock className="h-4 w-2/3 max-w-[420px]" />
      </div>
      <div className="flex max-w-[640px] items-center justify-between gap-4 rounded-2xl bg-black-2 px-5 py-4">
        <SkeletonBlock className="h-4 w-52" />
        <SkeletonBlock className="size-4 shrink-0" />
      </div>
    </div>
  );
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

function SectionIntroSkeleton() {
  return (
    <div className="space-y-2">
      <SkeletonBlock className="h-6 w-48" />
      <SkeletonBlock className="h-4 w-full max-w-[560px]" />
      <SkeletonBlock className="h-4 w-2/3 max-w-[380px]" />
    </div>
  );
}

function StatsPanelSkeleton() {
  return (
    <div
      className={`flex h-auto min-h-0 flex-col gap-6 rounded-level-2 bg-white/5 p-6 shadow-lg md:h-full md:justify-between md:gap-0 md:p-8 ${OVERVIEW_PANEL_MD_HEIGHT}`}
    >
      <div className="shrink-0 space-y-3">
        <SkeletonBlock className="h-8 w-3/4 md:h-9" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-7 w-36 rounded-full" />
      </div>

      <div className="shrink-0 space-y-2 rounded-2xl bg-white/10 p-5 md:p-4">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-5 w-2/3" />
        <SkeletonBlock className="h-4 w-1/3" />
      </div>

      <div className="shrink-0 space-y-2 rounded-2xl bg-white/10 p-5 md:p-4">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-5 w-2/3" />
        <SkeletonBlock className="h-4 w-1/3" />
      </div>

      <div className="shrink-0 space-y-2 rounded-2xl bg-white/10 p-4">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-9 w-24" />
      </div>

      <div className="shrink-0 space-y-4 md:space-y-3">
        <SkeletonBlock className="h-3 w-full rounded-full" />
        <div className="space-y-3 md:space-y-2">
          <div className="flex items-center justify-between gap-3">
            <SkeletonBlock className="h-4 w-2/5" />
            <SkeletonBlock className="h-5 w-16" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <SkeletonBlock className="h-4 w-2/5" />
            <SkeletonBlock className="h-5 w-16" />
          </div>
        </div>
      </div>

      <SkeletonBlock className="h-3 w-2/3 shrink-0" />
    </div>
  );
}

function RankedListPanelSkeleton() {
  return (
    <div className="flex h-full min-h-[280px] flex-col gap-4 rounded-level-2 bg-white/5 p-6 md:min-h-0">
      <SkeletonBlock className="h-6 w-3/4" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBlock className="h-4 w-6 shrink-0" />
          <SkeletonBlock className="h-4 max-w-[45%] flex-1" />
          <SkeletonBlock className="h-3 flex-1 rounded-full" />
          <SkeletonBlock className="h-4 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function FullListSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-level-2 bg-black-2 p-4">
      <SkeletonBlock className="h-10 w-full rounded-xl" />
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2">
          <SkeletonBlock className="h-4 w-6 shrink-0" />
          <SkeletonBlock className="h-4 max-w-[40%] flex-1" />
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
    <div className="space-y-8 md:space-y-10">
      <HeaderSkeleton />
      <DataChipSelectorSkeleton chipCount={chipCount} />

      <section className="space-y-4 md:space-y-5">
        <SectionIntroSkeleton />
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
          <SkeletonBlock
            className={`w-full rounded-level-2 ${OVERVIEW_PANEL_HEIGHT}`}
          />
          <StatsPanelSkeleton />
        </div>
      </section>

      <section className="space-y-4 md:space-y-5">
        <SectionIntroSkeleton />
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <RankedListPanelSkeleton />
          <RankedListPanelSkeleton />
        </div>
      </section>

      <section className="space-y-4 md:space-y-5">
        <SectionIntroSkeleton />
        <FullListSkeleton />
      </section>
    </div>
  );
}
