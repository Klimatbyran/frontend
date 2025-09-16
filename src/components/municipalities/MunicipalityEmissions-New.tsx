import { FC } from "react";
import { useTranslation } from "react-i18next";
import { MunicipalityEmissionsGraphNew } from "./emissionsGraph/MunicipalityEmissionsGraph-New";
import { DataPoint, SectorEmissions } from "@/types/municipality";
import {
  getDynamicChartHeight,
  useDataView,
  useHiddenItems,
  generateMunicipalityViewOptions,
  getMunicipalityDataViewPlaceholder,
} from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";

type DataView = "overview" | "sectors";

interface MunicipalityEmissionsNewProps {
  emissionsData: DataPoint[];
  sectorEmissions: SectorEmissions | null;
  className?: string;
}

export const MunicipalityEmissionsNew: FC<MunicipalityEmissionsNewProps> = ({
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

  return (
    <SectionWithHelp
      helpItems={[
        "parisAgreementLine",
        "municipalityImportanceOfEmissionSources",
      ]}
    >
      <CardHeader
        title={t("municipalityDetailPage.emissionsDevelopment")}
        tooltipContent={t("municipalityDetailPage.emissionsDevelopmentTooltip")}
        unit={t("municipalityDetailPage.inTons")}
        dataView={dataView}
        setDataView={(value) => setDataView(value as "overview" | "sectors")}
        dataViewOptions={generateMunicipalityViewOptions(hasSectorData, t)}
        dataViewPlaceholder={getMunicipalityDataViewPlaceholder(t)}
      />
      <div
        className="mt-8"
        style={{ height: getDynamicChartHeight(dataView, false) }}
      >
        <MunicipalityEmissionsGraphNew
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
