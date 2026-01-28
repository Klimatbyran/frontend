import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterBadge {
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
          <Badge
            key={index}
            variant="secondary"
            className="bg-blue-5/30 text-blue-2 pl-2 pr-1 flex items-center gap-1"
          >
            <span className="text-grey text-xs mr-1">
              {filter.type === "sort"
                ? t("explorePage.sorting")
                : t("explorePage.filter")}
            </span>
            {filter.label}
            {filter.type === "filter" && filter.onRemove && (
              <button
                type="button"
                title={t("explorePage.companies.removeFilter")}
                onClick={(e) => {
                  e.preventDefault();
                  filter.onRemove?.();
                }}
                className="hover:bg-blue-5/50 p-1 rounded-sm transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        );
      })}
    </div>
  );
}
