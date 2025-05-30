import { FC } from "react";
import { OverviewChart } from "./OverviewChart";
import { SectorsChart } from "./SectorsChart";
import { SectorEmissions } from "@/types/municipality";
import { useTranslation } from "react-i18next";

interface DataPoint {
  year: number;
  total?: number;
  trend?: number;
  paris?: number;
  gap?: number;
  approximated?: number;
}

type DataView = "overview" | "sectors";

interface MunicipalityEmissionsGraphProps {
  projectedData: DataPoint[];
  sectorEmissions?: SectorEmissions;
  dataView: DataView;
  hiddenSectors: Set<string>;
  setHiddenSectors: (sectors: Set<string>) => void;
}

export const MunicipalityEmissionsGraph: FC<
  MunicipalityEmissionsGraphProps
> = ({
  projectedData,
  sectorEmissions,
  dataView,
  hiddenSectors,
  setHiddenSectors,
}) => {
  const { t } = useTranslation();

  if (!projectedData || projectedData.length === 0) {
    return <div>{t("municipalities.graph.noData")}</div>;
  }

  return (
    <div className="h-full">
      {dataView === "overview" ? (
        <OverviewChart projectedData={projectedData} />
      ) : (
        <SectorsChart
          sectorEmissions={sectorEmissions || null}
          hiddenSectors={hiddenSectors}
          setHiddenSectors={setHiddenSectors}
        />
      )}
    </div>
  );
};
