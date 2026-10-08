import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type {
  DistributionBucket,
  KpiDistribution,
} from "@/utils/insights/kpiDistribution";

const TONE_TEXT = {
  good: "text-blue-2",
  mid: "text-orange-2",
  poor: "text-pink-3",
  muted: "text-white/55",
} as const;

const TONE_BAR = {
  good: "bg-blue-2",
  mid: "bg-orange-2",
  poor: "bg-pink-3",
  muted: "bg-white/35",
} as const;

function shareLabel(count: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((count / total) * 100)}%`;
}

function DistributionBar({
  buckets,
  label,
  tall,
}: {
  buckets: DistributionBucket[];
  label: string;
  tall: boolean;
}) {
  const summary = buckets
    .map((bucket) => `${bucket.count} ${bucket.label}`)
    .join(", ");

  return (
    <div
      className={cn("flex w-full gap-1", tall ? "h-4 md:h-5" : "h-3")}
      role="img"
      aria-label={`${label}: ${summary}`}
    >
      {buckets.map((bucket) => (
        <div
          key={bucket.id}
          className={cn(
            "h-full min-w-2 rounded-sm",
            TONE_BAR[bucket.tone],
            bucket.active ? "opacity-100" : "opacity-40",
          )}
          style={{ flex: `${bucket.count} 1 0` }}
        />
      ))}
    </div>
  );
}

function BucketCount({
  bucket,
  total,
  prominent,
}: {
  bucket: DistributionBucket;
  total: number;
  prominent: boolean;
}) {
  const { t } = useTranslation();

  return (
    <p
      className={cn(
        "min-w-0",
        bucket.active ? TONE_TEXT[bucket.tone] : "text-white/50",
      )}
    >
      <span
        className={cn(
          "font-light tabular-nums leading-none",
          prominent ? "text-3xl md:text-4xl" : "text-xl",
          !bucket.active && "text-white/80",
        )}
      >
        {bucket.count}
      </span>
      <span className={cn("ml-1.5", prominent ? "text-sm" : "text-xs")}>
        {bucket.label}
        {bucket.active && (
          <span className="sr-only">
            {" "}
            {t("detailPage.kpiPlacement.thisOne")}
          </span>
        )}
      </span>
      <span
        className={cn(
          "ml-1.5 tabular-nums text-white/40",
          prominent ? "text-sm" : "text-xs",
        )}
      >
        {shareLabel(bucket.count, total)}
      </span>
    </p>
  );
}

export function DistributionBlock({
  label,
  distribution,
  pending,
  spread,
}: {
  label: string;
  distribution: KpiDistribution | null;
  pending: boolean;
  spread: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={cn("flex min-w-0 flex-col justify-center", spread && "gap-3")}
      aria-busy={pending}
    >
      <p className="text-sm text-white/70">{label}</p>
      {pending ? (
        <span
          aria-hidden
          className="mt-2 h-4 w-full animate-pulse rounded-sm bg-white/10"
        />
      ) : distribution ? (
        <div className={cn(spread ? "space-y-3" : "mt-2 space-y-2")}>
          <DistributionBar
            buckets={distribution.buckets}
            label={label}
            tall={spread}
          />
          <div
            className={cn(spread ? "grid gap-3" : "flex flex-col gap-1")}
            style={
              spread
                ? {
                    gridTemplateColumns: `repeat(${distribution.buckets.length}, minmax(0, 1fr))`,
                  }
                : undefined
            }
          >
            {distribution.buckets.map((bucket) => (
              <BucketCount
                key={bucket.id}
                bucket={bucket}
                total={distribution.total}
                prominent={spread}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm leading-snug text-white/45">
          {t("detailPage.kpiPlacement.noComparison")}
        </p>
      )}
    </div>
  );
}
