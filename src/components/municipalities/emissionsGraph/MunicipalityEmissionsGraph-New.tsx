import { FC } from "react";
import { OverviewChartNew } from "./OverviewChart-New";
import { SectorsChartNew } from "./SectorsChart-New";
import { SectorEmissions, DataPoint } from "@/types/municipality";
import { useTranslation } from "react-i18next";

type DataView = "overview" | "sectors";

interface MunicipalityEmissionsGraphNewProps {
  projectedData: DataPoint[];
  sectorEmissions?: SectorEmissions;
  dataView: DataView;
  hiddenSectors: Set<string>;
  setHiddenSectors: (sectors: Set<string>) => void;
}

export const MunicipalityEmissionsGraphNew: FC<
  MunicipalityEmissionsGraphNewProps
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
        <OverviewChartNew projectedData={projectedData} />
      ) : (
        <SectorsChartNew
          sectorEmissions={sectorEmissions || null}
          hiddenSectors={hiddenSectors}
          setHiddenSectors={setHiddenSectors}
        />
      )}
    </div>
  );
};
