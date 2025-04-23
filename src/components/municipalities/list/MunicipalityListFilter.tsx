import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { regions } from "@/lib/constants/regions";
import { t } from "i18next";

type SortOption = "meets_paris" | "name";

interface MunicipalityFilterProps {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  sortDirection: "best" | "worst";
  setSortDirection: (direction: "best" | "worst") => void;
}

export default function MunicipalityFilter({
  selectedRegion,
  setSelectedRegion,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
}: MunicipalityFilterProps) {
  return (
    <div className="relative md:sticky md:top-0 md:z-10 bg-black px-4 pt-12 md:pt-16 pb-4 shadow-md">
      {/* Extending background to header */}
      <div className="absolute inset-0 w-full bg-black -z-10" />

      <div className="flex flex-col md:flex-row items-center gap-4 w-full flex-wrap">
        {/* Search Input */}
        <div className="relative w-full md:w-[350px]">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-grey w-4 h-4" />
          <Input
            type="text"
            placeholder={t(
              "municipalitiesComparePage.filter.searchPlaceholder",
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 py-1 h-10 bg-black-1 border-none text-sm w-full"
          />
        </div>

        {/* Region Select */}
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-full md:w-[250px] h-10 bg-black-1">
            <SelectValue
              placeholder={t("municipalitiesComparePage.filter.selectRegion")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("municipalitiesComparePage.filter.allRegions")}
            </SelectItem>
            {Object.keys(regions).map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sorting Select */}
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="w-full md:w-[250px] h-10 bg-black-1">
            <SelectValue
              placeholder={t("municipalitiesComparePage.sort.placeholder")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="meets_paris">
              {t("municipalitiesComparePage.sort.meetsParis")}
            </SelectItem>
            <SelectItem value="name">
              {t("municipalitiesComparePage.sort.name")}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Direction Button */}
        <button
          onClick={() =>
            setSortDirection(sortDirection === "best" ? "worst" : "best")
          }
          className="px-4 py-2 bg-gray-700 text-white text-sm rounded w-full md:w-[150px] h-10"
        >
          {sortBy === "name"
            ? sortDirection === "best"
              ? t("municipalitiesComparePage.sort.aToZ")
              : t("municipalitiesComparePage.sort.zToA")
            : sortDirection === "best"
              ? t("municipalitiesComparePage.sort.bestFirst")
              : t("municipalitiesComparePage.sort.worstFirst")}
        </button>
      </div>
    </div>
  );
}
