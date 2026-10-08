import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { KpiComparisonCard } from "./KpiComparisonCard";
import type { KpiCardModel } from "@/utils/detail/kpiCardModel";

export function KpiComparisonSection({
  title,
  cards,
  labelExtra,
  className,
}: {
  title: string;
  cards: KpiCardModel[];
  labelExtra?: (card: KpiCardModel) => ReactNode;
  className?: string;
}) {
  if (cards.length === 0) return null;

  return (
    <div className={cn("mt-8", className)}>
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
    </div>
  );
}
