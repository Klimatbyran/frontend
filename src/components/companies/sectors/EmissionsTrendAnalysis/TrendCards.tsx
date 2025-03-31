import React from "react";
import { TrendData } from "@/types/company";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useCategoryInfo } from "@/hooks/companies/useTrendAnalysis";
import TrendCard from "./TrendCard";

interface TrendCardsProps {
  trends: TrendData;
  selectedCategory: "decreasing" | "increasing" | "noComparable" | null;
  onCategorySelect: (
    category: "decreasing" | "increasing" | "noComparable" | null
  ) => void;
}

const TrendCards: React.FC<TrendCardsProps> = ({
  trends,
  selectedCategory,
  onCategorySelect,
}) => {
  const isMobile = useScreenSize();
  const categoryInfo = useCategoryInfo();
  return (
    <div
      className={`grid ${isMobile ? "grid-cols-1" : "md:grid-cols-3"} gap-6`}
    >
      {(Object.keys(trends) as Array<keyof TrendData>).map((category) => (
        <TrendCard
          key={category}
          category={category}
          data={trends[category]}
          isSelected={selectedCategory === category}
          onSelect={() =>
            !selectedCategory ? onCategorySelect(category) : null
          }
          onClose={() => onCategorySelect(null)}
          info={categoryInfo[category]}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};

export default TrendCards;
