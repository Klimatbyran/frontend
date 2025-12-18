import { FC } from "react";
import { useTranslation } from "react-i18next";
import { MunicipalityEmissionsGraph } from "./emissionsGraph/MunicipalityEmissionsGraph";
import { DataPoint } from "@/types/municipality";
import {
  getDynamicChartHeight,
  useDataView,
  useHiddenItems,
  useMunicipalityViewOptions,
} from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { SectorEmissionsByYear } from "@/types/emissions";

type DataView = "overview" | "sectors";

interface MunicipalityEmissionsProps {
  emissionsData: DataPoint[];
  sectorEmissions: SectorEmissionsByYear | null;
  className?: string;
}

export const MunicipalityEmissions: FC<MunicipalityEmissionsProps> = ({
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
    !!sectorEmissions && Object.keys(sectorEmissions).length > 0;

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
        <MunicipalityEmissionsGraph
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
