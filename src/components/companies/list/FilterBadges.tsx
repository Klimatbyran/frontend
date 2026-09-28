import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { getKpiChipClassName } from "@/components/ranked/KPIChip";
import { cn } from "@/lib/utils";

export interface FilterBadge {
  type: "filter" | "sort";
  label: string;
  onRemove?: () => void;
}

interface FilterBadgesProps {
  filters: FilterBadge[];
  view: "graphs" | "list";
}

export function FilterBadges({ filters, view }: FilterBadgesProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter, index) => {
        // Only show sorting badges in list view
        if (filter.type === "sort" && view !== "list") return null;

        return (
          <span
            key={index}
            className={cn(getKpiChipClassName(true), "pl-2 pr-1 gap-1.5")}
          >
            <span className="text-blue-3/70 text-xs">
              {filter.type === "sort"
                ? t("explorePage.sorting")
                : t("explorePage.filter")}
            </span>
            {filter.label}
            {filter.type === "filter" && filter.onRemove && (
              <button
                type="button"
                title={t("explorePage.removeFilter")}
                onClick={(e) => {
                  e.preventDefault();
                  filter.onRemove?.();
                }}
                className="hover:bg-blue-3/20 p-1 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
