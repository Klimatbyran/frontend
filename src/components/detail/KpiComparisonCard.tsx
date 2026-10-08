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
    <div
      className="flex items-baseline justify-between gap-3 py-1.5 text-sm"
      aria-busy={pending}
    >
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

      <div className="mt-4">
        {scopes.map((scope) => (
          <PlacementRow
            key={scope.id}
            label={scope.label}
            placement={scope.placement}
            pending={scope.pending}
          />
        ))}
      </div>
    </article>
  );
}
