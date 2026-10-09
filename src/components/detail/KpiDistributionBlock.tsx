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

const TONE_FILL = {
  good: "fill-blue-2",
  mid: "fill-orange-2",
  poor: "fill-pink-3",
  muted: "fill-grey",
} as const;

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function slicePath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polar(cx, cy, radius, startAngle);
  const end = polar(cx, cy, radius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

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

function DistributionPie({
  buckets,
  total,
  label,
  spread,
}: {
  buckets: DistributionBucket[];
  total: number;
  label: string;
  spread: boolean;
}) {
  const size = 32;
  const center = size / 2;
  const radius = 15;
  const summary = buckets
    .map((bucket) => `${bucket.count} ${bucket.label}`)
    .join(", ");
  let cursor = 0;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0", spread ? "size-20 md:size-24" : "size-14")}
      role="img"
      aria-label={`${label}: ${summary}`}
    >
      {buckets.map((bucket) => {
        const sweep = (bucket.count / total) * 360;
        const gap = buckets.length > 1 && sweep > 6 ? 1.4 : 0;
        const start = cursor + gap / 2;
        const end = cursor + sweep - gap / 2;
        cursor += sweep;

        if (sweep >= 359.9) {
          return (
            <circle
              key={bucket.id}
              cx={center}
              cy={center}
              r={radius}
              className={TONE_FILL[bucket.tone]}
            />
          );
        }

        return (
          <path
            key={bucket.id}
            d={slicePath(center, center, radius, start, end)}
            className={cn(
              TONE_FILL[bucket.tone],
              bucket.active ? "opacity-100" : "opacity-55",
            )}
          />
        );
      })}
    </svg>
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
  chart = "bar",
}: {
  label: string;
  distribution: KpiDistribution | null;
  pending: boolean;
  spread: boolean;
  chart?: "bar" | "pie";
}) {
  const { t } = useTranslation();
  const counts = distribution ? (
    <div
      className={cn(
        chart === "pie" || !spread ? "flex flex-col gap-1" : "grid gap-3",
      )}
      style={
        chart !== "pie" && spread
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
  ) : null;

  return (
    <div
      className={cn("flex min-w-0 flex-col justify-center", spread && "gap-3")}
      aria-busy={pending}
    >
      <p className="text-sm text-white/70">{label}</p>
      {pending ? (
        <span
          aria-hidden
          className={cn(
            "mt-2 animate-pulse bg-white/10",
            chart === "pie" ? "size-14 rounded-full" : "h-4 w-full rounded-sm",
          )}
        />
      ) : distribution && chart === "pie" ? (
        <div
          className={cn(
            "flex items-center",
            spread ? "mt-1 gap-5" : "mt-2 gap-3",
          )}
        >
          <DistributionPie
            buckets={distribution.buckets}
            total={distribution.total}
            label={label}
            spread={spread}
          />
          {counts}
        </div>
      ) : distribution ? (
        <div className={cn(spread ? "space-y-3" : "mt-2 space-y-2")}>
          <DistributionBar
            buckets={distribution.buckets}
            label={label}
            tall={spread}
          />
          {counts}
        </div>
      ) : (
        <p className="mt-2 text-sm leading-snug text-white/45">
          {t("detailPage.kpiPlacement.noComparison")}
        </p>
      )}
    </div>
  );
}
