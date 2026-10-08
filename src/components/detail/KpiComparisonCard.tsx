import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import { AiIcon } from "@/components/ui/ai-icon";
import { cn } from "@/lib/utils";
import {
  placementTone,
  type KpiPlacement,
} from "@/utils/insights/kpiPlacement";
import type { KpiCardModel } from "@/utils/detail/kpiCardModel";

const TONE_TEXT = {
  good: "text-blue-2",
  mid: "text-orange-2",
  poor: "text-pink-3",
} as const;

function PlacementBlock({
  label,
  placement,
  pending,
  spread,
}: {
  label: string;
  placement: KpiPlacement | null;
  pending: boolean;
  /** One comparison gets the full card width. Several share it in columns. */
  spread: boolean;
}) {
  const { t } = useTranslation();
  const tone = placement ? placementTone(placement) : null;
  const tiedCount = placement ? placement.tiedWith - 1 : 0;

  const rankValue = placement ? (
    <p
      className={cn(
        "font-light leading-none tracking-tight tabular-nums",
        spread ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl",
        tone ? TONE_TEXT[tone] : "text-white",
      )}
    >
      <span>#{placement.rank}</span>
      <span className="ml-2 align-baseline text-[0.42em] font-normal text-white/55">
        {t("detailPage.kpiPlacement.rankOf", { total: placement.total })}
      </span>
    </p>
  ) : (
    <p className="text-sm leading-snug text-white/45">
      {t("detailPage.kpiPlacement.noComparison")}
    </p>
  );

  const tied =
    tiedCount > 0 ? (
      <p className="text-sm text-white/55">
        {t("detailPage.kpiPlacement.tied", { count: tiedCount })}
      </p>
    ) : null;

  const pendingBar = (
    <span
      aria-hidden
      className={cn(
        "animate-pulse rounded bg-white/10",
        spread ? "h-10 w-36" : "h-9 w-28",
      )}
    />
  );

  if (spread) {
    return (
      <div className="flex items-end justify-between gap-4" aria-busy={pending}>
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-white/70">{label}</p>
          {!pending && tied}
          {!pending && !placement && rankValue}
        </div>
        {pending ? pendingBar : placement ? rankValue : null}
      </div>
    );
  }

  return (
    <div
      className="flex min-w-0 flex-col justify-center gap-1.5"
      aria-busy={pending}
    >
      <p className="text-sm text-white/70">{label}</p>
      {pending ? pendingBar : rankValue}
      {!pending && tied}
    </div>
  );
}

export function KpiComparisonCard({
  label,
  value,
  valueClassName,
  unit,
  href,
  infoText,
  showAiIcon,
  scopes,
  labelExtra,
}: KpiCardModel & { labelExtra?: ReactNode }) {
  const { t } = useTranslation();
  const openLabel = t("detailPage.kpiPlacement.openLink");

  return (
    <article className="flex h-full flex-col rounded-level-2 bg-black-1 p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
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
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={openLabel}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm text-blue-2 transition-colors hover:text-blue-1"
          >
            <span className="hidden sm:inline">{openLabel}</span>
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
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

      <div
        className={cn(
          "mt-5 grid flex-1 content-center gap-x-6 gap-y-4",
          scopes.length > 1 && "grid-cols-2",
        )}
      >
        {scopes.map((scope) => (
          <PlacementBlock
            key={scope.id}
            label={scope.label}
            placement={scope.placement}
            pending={scope.pending}
            spread={scopes.length === 1}
          />
        ))}
      </div>
    </article>
  );
}
