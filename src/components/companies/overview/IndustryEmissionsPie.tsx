import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useChartMotion } from "@/hooks/useChartMotion";
import { useEnteredView } from "@/hooks/useEnteredView";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import SectorPieChart, {
  type PieChartItem,
} from "@/components/charts/sectorChart/SectorPieChart";
import SectorPieLegend from "@/components/charts/sectorChart/SectorPieLegend";
import { sectorBaseColor } from "@/lib/constants/companyColors";
import type { SectorCode } from "@/lib/constants/sectors";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import type { PageIndustryBreakdown } from "@/types/pages";

export interface IndustryEmissionsPieProps {
  rows: PageIndustryBreakdown[];
  /** Sector to mark in the chart and legend. Null keeps every slice equal. */
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
  const { reduceMotion } = useChartMotion();
  const { ref, entered } = useEnteredView<HTMLElement>({
    enabled: !reduceMotion,
  });
  const show = reduceMotion || entered;

  const data = useMemo<PieChartItem[]>(() => {
    const items: PieChartItem[] = [];
    for (const row of rows) {
      const color = sectorBaseColor(row.code);
      if (!color) continue;
      const code = row.code as SectorCode;
      items.push({
        key: code,
        name: sectorNames[code] ?? row.code,
        value: row.emissions,
        color,
      });
    }
    return items;
  }, [rows, sectorNames]);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );

  if (data.length === 0) return null;

  return (
    <ScrollReveal>
      <section ref={ref} className="rounded-level-2 bg-black-2 p-6 md:p-7">
        <h2 className="text-xl font-light md:text-[21px]">
          {t("companiesOverviewPage.paris.industriesTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          {t("companiesOverviewPage.paris.industriesDescription")}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-8 md:gap-16 md:grid-cols-2 md:items-stretch">
          <div className="order-1 flex h-full min-h-[200px] min-w-0 items-center justify-center md:min-h-0">
            {show ? (
              <SectorPieChart
                data={data}
                fillContainer
                highlightedKey={selected}
              />
            ) : (
              <div className="min-h-[200px] w-full" />
            )}
          </div>

          <div className="order-3 flex h-full min-h-0 w-full flex-col justify-start md:order-2 md:min-h-0">
            {show && (
              <SectorPieLegend
                data={data}
                total={total}
                gridColumns={1}
                compact
                fillHeight
                highlightedKey={selected}
              />
            )}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
