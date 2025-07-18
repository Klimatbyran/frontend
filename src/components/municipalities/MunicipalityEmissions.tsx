import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { MunicipalityEmissionsGraph } from "./emissionsGraph/MunicipalityEmissionsGraph";
import { Municipality, DataPoint, SectorEmissions } from "@/types/municipality";
import { DataViewSelector } from "./DataViewSelector";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";

type DataView = "overview" | "sectors";

interface MunicipalityEmissionsProps {
  municipality: Municipality;
  emissionsData: DataPoint[];
  sectorEmissions: SectorEmissions | null;
  className?: string;
}

export const MunicipalityEmissions: FC<MunicipalityEmissionsProps> = ({
  municipality,
  emissionsData,
  sectorEmissions,
  className,
}) => {
  const { t } = useTranslation();
  const [dataView, setDataView] = useState<DataView>("overview");
  const [hiddenSectors, setHiddenSectors] = useState<Set<string>>(new Set());

  const hasSectorData =
    !!sectorEmissions && Object.keys(sectorEmissions).length > 0;

  return (
    <SectionWithHelp
      helpItems={[
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
          {!municipality.neededEmissionChangePercent && (
            <p className="mb-4">{t("municipalityDetailPage.noParisPath")}</p>
          )}
        </div>

        <DataViewSelector
          dataView={dataView}
          setDataView={setDataView}
          hasSectorData={hasSectorData}
        />
      </div>

      <div className="mt-8 h-[400px] mr-4 md:mr-8">
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
