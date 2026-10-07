import type { ReactNode } from "react";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import type { DataGuideItemId } from "@/data-guide/items";
import { KpiComparisonCard } from "./KpiComparisonCard";
import type { KpiCardModel } from "@/utils/detail/kpiCardModel";

export function KpiComparisonSection({
  title,
  helpItems,
  cards,
  labelExtra,
}: {
  title: string;
  helpItems: DataGuideItemId[];
  cards: KpiCardModel[];
  labelExtra?: (card: KpiCardModel) => ReactNode;
}) {
  if (cards.length === 0) return null;

  return (
    <SectionWithHelp
      helpItems={helpItems}
      className="bg-transparent px-0 py-0 rounded-none md:rounded-none md:px-0 md:py-0"
    >
      <h2 className="mb-4 text-xl font-light md:mb-5 md:text-[21px]">
        {title}
      </h2>
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <KpiComparisonCard
            key={card.id}
            {...card}
            labelExtra={labelExtra?.(card)}
          />
        ))}
      </div>
    </SectionWithHelp>
  );
}
