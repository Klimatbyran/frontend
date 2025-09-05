import { CardGrid } from "@/components/CardGrid";
import { MunicipalityCard } from "./MunicipalityCard";
import type { Municipality } from "@/types/municipality";

interface MunicipalityListProps {
  municipalities: Municipality[];
  selectedRegion: string;
  searchQuery: string;
  sortBy: "meets_paris" | "name";
  sortDirection: "best" | "worst";
}
export function MunicipalityList({
  municipalities,
  selectedRegion,
  searchQuery,
  sortBy,
  sortDirection,
}: MunicipalityListProps) {
  const filteredMunicipalities = municipalities.filter((municipality) => {
    if (selectedRegion !== "all" && municipality.region !== selectedRegion) {
      return false;
    }

    if (searchQuery) {
      const searchTerms = searchQuery
        .toLowerCase()
        .split(",")
        .map((term) => term.trim())
        .filter((term) => term.length > 0);

      return searchTerms.some((term) =>
        municipality.name.toLowerCase().startsWith(term),
      );
    }

    return true;
  });

  const sortedMunicipalities = filteredMunicipalities.sort((a, b) => {
    const directionMultiplier = sortDirection === "best" ? 1 : -1;
    switch (sortBy) {
      case "meets_paris": {
        return directionMultiplier * (a ? 1 : 0); // fixme!
      }
      case "name":
        return directionMultiplier * a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      <CardGrid
        items={sortedMunicipalities}
        itemContent={(municipality) => {
          return (
            <MunicipalityCard
              key={municipality.name}
              municipality={municipality}
            />
          );
        }}
      />
    </div>
  );
}
