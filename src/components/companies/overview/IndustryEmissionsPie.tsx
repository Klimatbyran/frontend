import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import SectorPieChart, {
  type PieChartItem,
} from "@/components/charts/sectorChart/SectorPieChart";
import SectorPieLegend from "@/components/charts/sectorChart/SectorPieLegend";
import type { IndustryBreakdownRow } from "@/hooks/companies/parisOverviewUtils";
import { sectorColors } from "@/lib/constants/companyColors";
import type { SectorCode } from "@/lib/constants/sectors";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";

export interface IndustryEmissionsPieProps {
  rows: IndustryBreakdownRow[];
  /** Drives chart re-animation when the chip filter changes. */
  selected: SectorCode | null;
}

/**
 * Each slice is one sector. Size is that sector's share of total emissions,
 * and colour is the sector colour used everywhere else on the page.
 */
export function IndustryEmissionsPie({
  rows,
  selected,
}: IndustryEmissionsPieProps) {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();
  const pieAnimationKey = selected ?? "all";

  const data = useMemo<PieChartItem[]>(
    () =>
      rows.map((row) => ({
        key: row.code,
        name: sectorNames[row.code],
        value: row.emissions,
        color: sectorColors[row.code].base,
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
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        {t("companiesOverviewPage.paris.industriesDescription")}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 md:gap-16 lg:grid-cols-2 lg:items-stretch">
        <div className="order-1 flex h-full min-h-[200px] min-w-0 items-center justify-center lg:min-h-0">
          <SectorPieChart
            data={data}
            animationKey={pieAnimationKey}
            fillContainer
          />
        </div>

        <div className="order-3 flex h-full min-h-0 w-full flex-col justify-start lg:order-2 lg:min-h-0">
          <SectorPieLegend
            data={data}
            total={total}
            gridColumns={1}
            compact
            fillHeight
            animationKey={pieAnimationKey}
          />
        </div>
      </div>
    </section>
  );
}
