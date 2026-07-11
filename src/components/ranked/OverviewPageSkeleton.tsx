import {
  OVERVIEW_PANEL_HEIGHT,
  OVERVIEW_PANEL_MD_HEIGHT,
} from "@/components/ranked/OverviewSplitLayout";
import { PageHeader } from "@/components/layout/PageHeader";

export type OverviewPageSkeletonVariant =
  | "municipalities"
  | "regions"
  | "companies";

interface OverviewPageSkeletonProps {
  title: string;
  description?: string;
  variant?: OverviewPageSkeletonVariant;
  /** Number of KPI chip placeholders on desktop */
  chipCount?: number;
}

const SHIMMER = "bg-white/10 rounded animate-pulse";

const CHIP_WIDTHS = ["w-20", "w-28", "w-24", "w-32", "w-28", "w-36", "w-24"];

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`${SHIMMER} ${className}`} />;
}

function KPIChipSelectorSkeleton({
  chipCount,
  showActions = false,
}: {
  chipCount: number;
  showActions?: boolean;
}) {
  return (
    <div className="mb-6 space-y-3">
      <SkeletonBlock className="h-3 w-36 mx-1" />
      <div className="md:hidden space-y-2">
        <SkeletonBlock className="h-12 w-full rounded-xl" />
        {showActions && (
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-9 w-24 rounded-md" />
          </div>
        )}
      </div>
      <div className="hidden md:flex flex-wrap items-center gap-2">
        {Array.from({ length: chipCount }, (_, i) => (
          <SkeletonBlock
            key={i}
            className={`h-9 rounded-full ${CHIP_WIDTHS[i % CHIP_WIDTHS.length]}`}
          />
        ))}
        {showActions && <SkeletonBlock className="h-9 w-24 rounded-md" />}
      </div>
    </div>
  );
}

function StatsPanelSkeleton() {
  return (
    <div
      className={`p-6 md:p-8 flex flex-col gap-6 md:gap-0 md:justify-between h-auto md:h-full min-h-0 bg-white/5 rounded-level-2 shadow-lg ${OVERVIEW_PANEL_MD_HEIGHT}`}
    >
      <div className="space-y-3 shrink-0">
        <SkeletonBlock className="h-8 md:h-9 w-3/4" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-7 w-36 rounded-full" />
      </div>

      <div className="p-5 md:p-4 bg-white/10 rounded-2xl space-y-2 shrink-0">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-5 w-2/3" />
        <SkeletonBlock className="h-4 w-1/3" />
      </div>

      <div className="p-5 md:p-4 bg-white/10 rounded-2xl space-y-2 shrink-0">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-5 w-2/3" />
        <SkeletonBlock className="h-4 w-1/3" />
      </div>

      <div className="p-4 bg-white/10 rounded-2xl shrink-0 space-y-2">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-9 w-24" />
      </div>

      <div className="space-y-4 md:space-y-3 shrink-0">
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

function VisualizationPanelSkeleton() {
  return (
    <div className={`flex flex-col ${OVERVIEW_PANEL_HEIGHT}`}>
      <SkeletonBlock className="md:hidden shrink-0 mb-3 h-10 w-full rounded-xl" />
      <SkeletonBlock className="flex-1 min-h-0 w-full rounded-level-2" />
    </div>
  );
}

function RankedListPanelSkeleton() {
  return (
    <div className="bg-white/5 rounded-level-2 p-6 h-full min-h-[320px] md:min-h-[400px] flex flex-col gap-4">
      <SkeletonBlock className="h-6 w-3/4" />
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBlock className="h-4 w-6 shrink-0" />
          <SkeletonBlock className="h-4 flex-1 max-w-[45%]" />
          <SkeletonBlock className="h-3 flex-1 rounded-full" />
          <SkeletonBlock className="h-4 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function DistributionPanelSkeleton() {
  return (
    <div className="bg-white/5 rounded-level-2 p-6 flex flex-col h-full min-h-[320px] md:min-h-[400px] gap-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-7 w-1/2" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
      </div>
      <SkeletonBlock className="w-full flex-1 min-h-[180px] rounded-level-1" />
    </div>
  );
}

/** Skeleton that mirrors the overview page layout while data loads. */
export function OverviewPageSkeleton({
  title,
  description,
  variant = "municipalities",
  chipCount = variant === "regions" ? 2 : variant === "companies" ? 2 : 7,
}: OverviewPageSkeletonProps) {
  return (
    <>
      <PageHeader title={title} description={description} className="-ml-4" />

      <KPIChipSelectorSkeleton
        chipCount={chipCount}
        showActions={variant === "companies"}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 items-stretch">
          <VisualizationPanelSkeleton />
          <div className="min-h-0 h-full min-w-0 overflow-visible">
            <StatsPanelSkeleton />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <RankedListPanelSkeleton />
          <RankedListPanelSkeleton />
          <DistributionPanelSkeleton />
        </div>
      </div>
    </>
  );
}
