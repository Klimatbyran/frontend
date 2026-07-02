import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ListCardProps } from "@/components/explore/ListCard";
import { ExploreEntityList } from "@/components/explore/ExploreEntityList";

interface EuropeanCountryExploreListProps {
  items: ListCardProps[];
  headerAction?: React.ReactNode;
}

export function EuropeanCountryExploreList({
  items,
  headerAction,
}: EuropeanCountryExploreListProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return items;
    }

    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, searchQuery]);

  return (
    <div className="space-y-4">
      {headerAction && (
        <div className="flex justify-end md:hidden">{headerAction}</div>
      )}
      <ExploreEntityList
        items={filteredItems}
        filterProps={{
          searchQuery,
          setSearchQuery,
          sortBy: "name",
          setSortBy: () => undefined,
          sortDirection: "asc",
          setSortDirection: () => undefined,
          filterGroups: [],
          activeFilters: [],
          sortOptions: [],
          searchPlaceholder: t("rankedList.search.placeholder"),
          hideListControls: true,
        }}
      />
    </div>
  );
}
