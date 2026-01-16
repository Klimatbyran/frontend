import { FC } from "react";
import { useTranslation } from "react-i18next";
import { SectorEmissions } from "@/hooks/territories/useSectorEmissions";
import { OverviewChart } from "@/components/municipalities/emissionsGraph/OverviewChart";
import { SectorsChart } from "@/components/municipalities/emissionsGraph/SectorsChart";
import { DataPoint } from "@/types/municipality";

type DataView = "overview" | "sectors";

interface RegionEmissionsGraphProps {
  projectedData: DataPoint[];
  sectorEmissions?: SectorEmissions;
  dataView: DataView;
  hiddenSectors: Set<string>;
  setHiddenSectors: (sectors: Set<string>) => void;
}

export const RegionEmissionsGraph: FC<RegionEmissionsGraphProps> = ({
  projectedData,
  sectorEmissions,
  dataView,
  hiddenSectors,
  setHiddenSectors,
}) => {
  const { t } = useTranslation();

  if (!projectedData || projectedData.length === 0) {
    return <div>{t("detailPage.graph.noData")}</div>;
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
