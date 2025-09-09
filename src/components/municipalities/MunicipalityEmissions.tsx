import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { MunicipalityEmissionsGraph } from "./emissionsGraph/MunicipalityEmissionsGraph";
import { DataPoint, SectorEmissions } from "@/types/municipality";
import { DataViewSelector } from "./DataViewSelector";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";

type DataView = "overview" | "sectors";

interface MunicipalityEmissionsProps {
  emissionsData: DataPoint[];
  sectorEmissions: SectorEmissions | null;
}

export const MunicipalityEmissions: FC<MunicipalityEmissionsProps> = ({
  emissionsData,
  sectorEmissions,
}) => {
  const { t } = useTranslation();
  const [dataView, setDataView] = useState<DataView>("overview");
  const [hiddenSectors, setHiddenSectors] = useState<Set<string>>(new Set());

  const hasSectorData =
    !!sectorEmissions && Object.keys(sectorEmissions).length > 0;

  return (
    <SectionWithHelp
      helpItems={[
        "municipalityEmissionEstimatations",
        "municipalityWhyDataDelay",
        "municipalityDeeperChanges",
        "municipalityCanWeExtendCarbonBudget",
        "parisAgreementLine",
        "municipalityImportanceOfEmissionSources",
      ]}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <Text className="text-2xl md:text-4xl">
            {t("municipalityDetailPage.emissionsDevelopment")}
          </Text>
          <Text className="text-grey mb-4">
            {t("municipalityDetailPage.inTons")}
          </Text>
        </div>

        <DataViewSelector
          dataView={dataView}
          setDataView={setDataView}
          hasSectorData={hasSectorData}
        />
      </div>

      <div className="mt-8 h-[400px]">
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
