import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { MunicipalityList } from "@/components/municipalities/list/MunicipalityList";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import MunicipalityFilter from "@/components/municipalities/list/MunicipalityListFilter";
import {
  isMunicipalitySortBy,
  isMunicipalitySortDirection,
  MunicipalitySortBy,
  MunicipalitySortDirection,
} from "@/types/municipality";
import { useSearchParams } from "react-router-dom";

export function MunicipalitiesComparePage() {
  const { t } = useTranslation();
  const { municipalities, loading, error } = useMunicipalities();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedRegion = searchParams.get("selectedRegion") || "all";
  const searchQuery = searchParams.get("searchQuery") || "";
  const sortBy = isMunicipalitySortBy(searchParams.get("sortBy") ?? "") ? searchParams.get("sortBy") as MunicipalitySortBy : "meets_paris"; 
  const sortDirection = isMunicipalitySortDirection(searchParams.get("sortDirection") ?? "") ? searchParams.get("sortDirection") as MunicipalitySortDirection : "best"; 

  const setOrDeleteSearchParam = (value: string | null, param: string) => setSearchParams((searchParams) => {
    value ? searchParams.set(param, value) : searchParams.delete(param);
    return searchParams;
  }, { replace: true });

  const setSelectedRegion = (selectedRegion: string) => setOrDeleteSearchParam(selectedRegion, "selectedRegion");
  const setSearchQuery = (searchQuery: string) => setOrDeleteSearchParam(searchQuery, "searchQuery");
  const setSortBy = (sortBy: string) => setOrDeleteSearchParam(sortBy, "sortBy");
  const setSortDirection = (sortDirection: string) => setOrDeleteSearchParam(sortDirection, "sortDirection");

  if (loading) {
    return (
      <div className="animate-pulse space-y-16">
        <div className="h-12 w-1/3 bg-black-1 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-black-1 rounded-level-2" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <h3 className="text-red-500 mb-4 text-xl">
          {t("municipalitiesComparePage.errorTitle")}
        </h3>
        <p className="text-grey">
          {t("municipalitiesComparePage.errorDescription")}
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={t("municipalitiesComparePage.title")}
        description={t("municipalitiesComparePage.description")}
        className="-ml-4"
      />

      <MunicipalityFilter
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
      />

      <MunicipalityList
        municipalities={municipalities}
        selectedRegion={selectedRegion}
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortDirection={sortDirection}
      />
    </>
  );
}
