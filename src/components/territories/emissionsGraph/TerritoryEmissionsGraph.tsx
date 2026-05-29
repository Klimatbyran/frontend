import { FC } from "react";
import { useTranslation } from "react-i18next";
import { DataPoint, NationDataPoint, SectorEmissions } from "@/types/emissions";
import { OverviewChart } from "@/components/territories/emissionsGraph/OverviewChart";
import { NationOverviewChart } from "@/components/territories/emissionsGraph/NationOverviewChart";
import { SectorsChart } from "@/components/territories/emissionsGraph/SectorsChart";

type DataView = "overview" | "sectors";

interface TerritoryEmissionsGraphProps {
  projectedData: DataPoint[] | NationDataPoint[];
  sectorEmissions?: SectorEmissions;
  dataView: DataView;
  hiddenSectors: Set<string>;
  setHiddenSectors: (sectors: Set<string>) => void;
  stackedOverview?: boolean;
}

export const TerritoryEmissionsGraph: FC<TerritoryEmissionsGraphProps> = ({
  projectedData,
  sectorEmissions,
  dataView,
  hiddenSectors,
  setHiddenSectors,
  stackedOverview = false,
}) => {
  const { t } = useTranslation();

  if (!projectedData || projectedData.length === 0) {
    return <div>{t("detailPage.graph.noData")}</div>;
  }

  return (
    <div className="h-full">
      {dataView === "overview" ? (
        stackedOverview ? (
          <NationOverviewChart
            projectedData={projectedData as NationDataPoint[]}
          />
        ) : (
          <OverviewChart projectedData={projectedData as DataPoint[]} />
        )
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
