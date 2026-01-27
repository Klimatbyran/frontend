import { FC } from "react";
import { useTranslation } from "react-i18next";
import { DataPoint } from "@/types/emissions";
import {
  getDynamicChartHeight,
  useDataView,
  useHiddenItems,
  useMunicipalityViewOptions,
} from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { SectorEmissions } from "@/types/emissions";
import { TerritoryEmissionsGraph } from "./emissionsGraph/TerritoryEmissionsGraph";

type DataView = "overview" | "sectors";

interface TerritoryEmissionsProps {
  emissionsData: DataPoint[];
  sectorEmissions: SectorEmissions | null;
  className?: string;
}

export const TerritoryEmissions: FC<TerritoryEmissionsProps> = ({
  emissionsData,
  sectorEmissions,
}) => {
  const { t } = useTranslation();

  const { dataView, setDataView } = useDataView<DataView>("overview", [
    "overview",
    "sectors",
  ]);
  const { hiddenItems: hiddenSectors, setHiddenItems: setHiddenSectors } =
    useHiddenItems<string>([]);

  const hasSectorData =
    !!sectorEmissions?.sectors &&
    Object.keys(sectorEmissions.sectors).length > 0;

  const dataViewOptions = useMunicipalityViewOptions(hasSectorData);

  return (
    <SectionWithHelp
      helpItems={[
        "parisAgreementLine",
        "municipalityImportanceOfEmissionSources",
      ]}
    >
      <CardHeader
        title={t("detailPage.emissionsDevelopment")}
        unit={t("detailPage.inTons")}
        dataView={dataView}
        setDataView={(value) => setDataView(value as "overview" | "sectors")}
        dataViewOptions={dataViewOptions}
        dataViewPlaceholder={t("municipalities.graph.selectView")}
      />
      <div
        className="mt-8"
        style={{ height: getDynamicChartHeight(dataView, false) }}
      >
        <TerritoryEmissionsGraph
          projectedData={emissionsData}
          sectorEmissions={sectorEmissions || undefined}
          dataView={dataView}
          hiddenSectors={hiddenSectors}
          setHiddenSectors={setHiddenSectors}
        />
      </div>
    </SectionWithHelp>
  );
};
