import { FC } from "react";
import { useTranslation } from "react-i18next";
import { DataPoint } from "@/types/emissions";
import { SectorEmissions } from "@/types/emissions";
import { OverviewChart } from "@/components/territories/emissionsGraph/OverviewChart";
import { SectorsChart } from "@/components/territories/emissionsGraph/SectorsChart";

type DataView = "overview" | "sectors";

interface TerritoryEmissionsGraphProps {
  projectedData: DataPoint[];
  sectorEmissions?: SectorEmissions;
  dataView: DataView;
  hiddenSectors: Set<string>;
  setHiddenSectors: (sectors: Set<string>) => void;
}

export const TerritoryEmissionsGraph: FC<TerritoryEmissionsGraphProps> = ({
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
