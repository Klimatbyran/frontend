import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import { AiIcon } from "@/components/ui/ai-icon";
import { cn } from "@/lib/utils";
import {
  placementMarker,
  placementTone,
  type KpiPlacement,
} from "@/utils/insights/kpiPlacement";
import type { KpiCardModel } from "@/utils/detail/kpiCardModel";

const TONE_COLOR = {
  good: "var(--blue-3)",
  mid: "var(--orange-2)",
  poor: "var(--pink-3)",
} as const;

const TONE_TEXT = {
  good: "text-blue-2",
  mid: "text-orange-2",
  poor: "text-pink-3",
} as const;

function PlacementTrack({ placement }: { placement: KpiPlacement }) {
  const tone = placementTone(placement);
  const marker = placementMarker(placement);
  const color = TONE_COLOR[tone];

  return (
    <div className="relative mt-2 h-1.5 rounded-full bg-white/10" aria-hidden>
      <span
        className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-black-2"
        style={{
          left: `calc(${marker} * (100% - 0.625rem) + 0.3125rem)`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

function PlacementRow({
  label,
  placement,
  pending,
}: {
  label: string;
  placement: KpiPlacement | null;
  pending: boolean;
}) {
  const { t } = useTranslation();
  const tone = placement ? placementTone(placement) : null;
  const rankLabel = placement
    ? t("detailPage.kpiPlacement.rank", {
        rank: placement.rank,
        total: placement.total,
      })
    : null;
  const tiedCount = placement ? placement.tiedWith - 1 : 0;

  return (
    <div className="border-t border-white/10 py-2.5" aria-busy={pending}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-white/55">{label}</span>
        {pending ? (
          <span
            aria-hidden
            className="h-4 w-24 animate-pulse rounded bg-white/10"
          />
        ) : rankLabel ? (
          <span
            className={cn(
              "text-right font-medium tabular-nums",
              tone ? TONE_TEXT[tone] : "text-white",
            )}
          >
            {rankLabel}
            {tiedCount > 0 && (
              <span className="mt-0.5 block text-xs font-normal text-white/45">
                {t("detailPage.kpiPlacement.tied", { count: tiedCount })}
              </span>
            )}
          </span>
        ) : (
          <span className="text-right text-white/40">
            {t("detailPage.kpiPlacement.noComparison")}
          </span>
        )}
      </div>
      {placement && !pending && <PlacementTrack placement={placement} />}
    </div>
  );
}

export function KpiComparisonCard({
  label,
  value,
  valueClassName,
  unit,
  caption,
  href,
  infoText,
  showAiIcon,
  scopes,
  labelExtra,
}: KpiCardModel & { labelExtra?: ReactNode }) {
  const { t } = useTranslation();

  return (
    <article className="flex h-full flex-col rounded-level-2 bg-black-2 p-5 md:p-6">
      <div className="flex items-start gap-2">
        <p className="text-sm text-white/60">{label}</p>
        {labelExtra}
        {infoText && (
          <span className="text-grey">
            <InfoTooltip ariaLabel={label}>
              <p>{infoText}</p>
            </InfoTooltip>
          </span>
        )}
      </div>

      <div className="mt-3 flex items-start gap-2">
        <p
          className={cn(
            "text-4xl font-light leading-none tracking-tight tabular-nums md:text-5xl",
            valueClassName,
          )}
        >
          {value}
          {unit && (
            <span className="ml-2 text-base font-light text-grey md:text-xl">
              {unit}
            </span>
          )}
        </p>
        {showAiIcon && <AiIcon size="md" />}
      </div>

      {caption && (
        <p className="mt-3 text-sm leading-relaxed text-white/60">{caption}</p>
      )}

      <div className="mt-5">
        {scopes.map((scope) => (
          <PlacementRow
            key={scope.id}
            label={scope.label}
            placement={scope.placement}
            pending={scope.pending}
          />
        ))}
      </div>

      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-2 transition-colors hover:text-blue-1"
        >
          {t("detailPage.kpiPlacement.openLink")}
          <ArrowUpRight className="size-4" />
        </a>
      )}
    </article>
  );
}
