import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useChartMotion } from "@/hooks/useChartMotion";
import SectorPieChart, {
  type PieChartItem,
} from "@/components/charts/sectorChart/SectorPieChart";
import SectorPieLegend from "@/components/charts/sectorChart/SectorPieLegend";
import { DetailPieSectorGrid } from "@/components/detail/DetailGrid";
import {
  SHARE_RAMP_STOPS,
  shareRampColor,
  type IndustryBreakdownRow,
} from "@/hooks/companies/parisOverviewUtils";
import type { SectorCode } from "@/lib/constants/sectors";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";

export interface IndustryEmissionsPieProps {
  rows: IndustryBreakdownRow[];
  /** Drives chart re-animation when the chip filter changes. */
  selected: SectorCode | null;
}

/**
 * Slice size is the industry's share of emissions; slice colour is the share
 * of its companies on track. Two encodings, so the ramp is spelled out below
 * the chart rather than left for the reader to infer.
 */
export function IndustryEmissionsPie({
  rows,
  selected,
}: IndustryEmissionsPieProps) {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();
  const { reduceMotion, fadeDuration, stagger, ease } = useChartMotion();
  const pieAnimationKey = selected ?? "all";

  const data = useMemo<PieChartItem[]>(
    () =>
      rows.map((row) => ({
        key: row.code,
        name: sectorNames[row.code],
        value: row.emissions,
        color: shareRampColor(row.onTrackShare),
      })),
    [rows, sectorNames],
  );

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );

  if (data.length === 0) return null;

  return (
    <section className="rounded-level-2 bg-black-2 p-6 md:p-7">
      <h2 className="text-xl font-light md:text-[21px]">
        {t("companiesOverviewPage.paris.industriesTitle")}
      </h2>
      <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-white/60">
        {t("companiesOverviewPage.paris.industriesDescription")}
      </p>

      <div className="mt-6">
        <DetailPieSectorGrid stretchColumns>
          <div className="min-w-0 w-full">
            <SectorPieChart data={data} animationKey={pieAnimationKey} />
            <div className="mt-6">
              <div className="flex">
                {SHARE_RAMP_STOPS.map((stop, index) => (
                  <motion.i
                    key={stop}
                    className={`h-2.5 flex-1 ${
                      index === 0
                        ? "rounded-l-sm"
                        : index === SHARE_RAMP_STOPS.length - 1
                          ? "rounded-r-sm"
                          : ""
                    }`}
                    style={{
                      backgroundColor: stop,
                      transformOrigin: "bottom",
                    }}
                    initial={reduceMotion ? false : { opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{
                      duration: fadeDuration,
                      delay: stagger(index, 0.05),
                      ease,
                    }}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-grey">
                <span>{t("companiesOverviewPage.paris.rampLow")}</span>
                <span>{t("companiesOverviewPage.paris.rampHigh")}</span>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 w-full flex-col justify-start lg:h-full lg:min-h-0">
            <SectorPieLegend
              data={data}
              total={total}
              gridColumns={1}
              compact
              fillHeight
              animationKey={pieAnimationKey}
            />
          </div>
        </DetailPieSectorGrid>
      </div>
    </section>
  );
}
