import { useQuery } from "@tanstack/react-query";
import { SectorEmissions } from "@/types/municipality";

export function useMunicipalitySectorEmissions(id: string | undefined) {
  const {
    data: sectorEmissions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["municipalitySectorEmissions", id],
    queryFn: () =>
      fetch(`/api/municipalities/${id}/sector-emissions`).then((res) =>
        res.json(),
      ),
    enabled: !!id,
  });

  return {
    sectorEmissions: (sectorEmissions as SectorEmissions) || null,
    loading: isLoading,
    error,
  };
}
