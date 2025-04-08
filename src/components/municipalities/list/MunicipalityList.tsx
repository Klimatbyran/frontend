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
        const aMeetsParis = a.budgetRunsOut === null;
        const bMeetsParis = b.budgetRunsOut === null;
        if (aMeetsParis && bMeetsParis) {
          return (
            directionMultiplier *
            ((a.hitNetZero ? new Date(a.hitNetZero).getTime() : 0) -
              (b.hitNetZero ? new Date(b.hitNetZero).getTime() : 0))
          );
        }
        if (aMeetsParis) {
          return -1 * directionMultiplier;
        }
        if (bMeetsParis) {
          return 1 * directionMultiplier;
        }
        return (
          directionMultiplier *
          ((b.budgetRunsOut ? new Date(b.budgetRunsOut).getTime() : 0) -
            (a.budgetRunsOut ? new Date(a.budgetRunsOut).getTime() : 0))
        );
      }
      case "name":
        return directionMultiplier * a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedMunicipalities.map((municipality) => (
          <MunicipalityCard
            key={municipality.name}
            municipality={municipality}
          />
        ))}
      </div>
    </div>
  );
}
