import { useTranslation } from "react-i18next";
import type { ParisSummary } from "@/hooks/companies/parisOverviewUtils";

/**
 * A handful of companies still has to fill the block, so the dots grow as the
 * selection shrinks instead of trailing off as one sparse row.
 */
function dotSize(total: number): number {
  if (total <= 24) return 22;
  if (total <= 60) return 16;
  return 12;
}

interface BreakdownRowProps {
  color: string;
  label: string;
  count: number;
  total: number;
}

function BreakdownRow({ color, label, count, total }: BreakdownRowProps) {
  return (
    <div className="flex items-center gap-2.5 border-t border-white/10 py-3 text-sm last:border-b">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="min-w-0 flex-1 text-white/70">{label}</span>
      <span className="font-medium tabular-nums">{count}</span>
      <span className="w-11 text-right tabular-nums text-white/40">
        {total ? Math.round((count / total) * 100) : 0}%
      </span>
    </div>
  );
}

export interface ParisAnswerCardProps {
  summary: ParisSummary;
  /** Translated industry name when one is selected, otherwise null. */
  industryLabel: string | null;
}

export function ParisAnswerCard({
  summary,
  industryLabel,
}: ParisAnswerCardProps) {
  const { t } = useTranslation();
  const { total, onTrack, offTrack, unknown, reducing, onTrackPercent } =
    summary;

  if (total === 0) {
    return (
      <section className="rounded-level-2 bg-black-2 px-6 py-8 md:px-10 md:py-9">
        <p className="mb-3.5 text-xs uppercase tracking-[0.09em] text-white/45">
          {t("companiesOverviewPage.paris.kicker")}
        </p>
        <p className="text-2xl font-light">
          {t("companiesOverviewPage.paris.emptyHeading")}
        </p>
        <p className="mt-3.5 text-base leading-relaxed text-white/65">
          {t("companiesOverviewPage.paris.emptyBody")}
        </p>
      </section>
    );
  }

  const scope = industryLabel
    ? t("companiesOverviewPage.paris.scopeIndustry", {
        industry: industryLabel,
      })
    : t("companiesOverviewPage.paris.scopeAll");

  const size = dotSize(total);
  const dots = [
    ...Array<string>(onTrack).fill("var(--blue-3)"),
    ...Array<string>(offTrack).fill("var(--pink-3)"),
    ...Array<string>(unknown).fill("rgba(255,255,255,0.2)"),
  ];

  return (
    <section className="grid items-center gap-9 rounded-level-2 bg-black-2 px-6 py-8 md:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)] md:gap-14 md:px-10 md:py-9">
      <div>
        <p className="mb-3.5 text-xs uppercase tracking-[0.09em] text-white/45">
          {t("companiesOverviewPage.paris.kicker")}
        </p>
        <p className="max-w-[620px] text-[22px] font-light leading-snug md:text-[28px]">
          <b className="mb-3 block text-[68px] font-medium leading-none tracking-tighter text-blue-2 tabular-nums md:text-[92px]">
            {onTrack}
          </b>
          {t("companiesOverviewPage.paris.heading", { count: total, scope })}
        </p>
        <p className="mt-4 max-w-[620px] text-base leading-relaxed text-white/65">
          {t("companiesOverviewPage.paris.share", { percent: onTrackPercent })}{" "}
          {reducing > onTrack
            ? t("companiesOverviewPage.paris.manyCutting")
            : t("companiesOverviewPage.paris.restTooSlow")}
        </p>
      </div>

      <div>
        <p className="text-xs text-white/40">
          {t("companiesOverviewPage.paris.dotNote")}
        </p>
        <div
          aria-hidden="true"
          className="mt-2.5 flex flex-wrap"
          style={{ gap: size > 16 ? 9 : 6 }}
        >
          {dots.map((color, index) => (
            <span
              key={index}
              className="block rounded-full"
              style={{ width: size, height: size, backgroundColor: color }}
            />
          ))}
        </div>
        <div className="mt-3.5">
          <BreakdownRow
            color="var(--blue-3)"
            label={t("companiesOverviewPage.paris.onTrack")}
            count={onTrack}
            total={total}
          />
          <BreakdownRow
            color="var(--pink-3)"
            label={t("companiesOverviewPage.paris.offTrack")}
            count={offTrack}
            total={total}
          />
          <BreakdownRow
            color="rgba(255,255,255,0.2)"
            label={t("companiesOverviewPage.paris.notEnoughData")}
            count={unknown}
            total={total}
          />
        </div>
      </div>
    </section>
  );
}
