import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { MunicipalityEmissionsGraph } from "./emissionsGraph/MunicipalityEmissionsGraph";
import { MunicipalityEmissionsGraphNew } from "./emissionsGraph/MunicipalityEmissionsGraph-New";
import { Municipality, DataPoint, SectorEmissions } from "@/types/municipality";
import { DataViewSelector } from "./DataViewSelector";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { Button } from "@/components/ui/button";

type DataView = "overview" | "sectors";

interface MunicipalityEmissionsNewProps {
  municipality: Municipality;
  emissionsData: DataPoint[];
  sectorEmissions: SectorEmissions | null;
  className?: string;
}

export const MunicipalityEmissionsNew: FC<MunicipalityEmissionsNewProps> = ({
  municipality,
  emissionsData,
  sectorEmissions,
  className,
}) => {
  const { t } = useTranslation();
  const [dataView, setDataView] = useState<DataView>("overview");
  const [hiddenSectors, setHiddenSectors] = useState<Set<string>>(new Set());
  const [showNewVersion, setShowNewVersion] = useState(false);

  const hasSectorData =
    !!sectorEmissions && Object.keys(sectorEmissions).length > 0;

  return (
    <SectionWithHelp
      helpItems={[
        "parisAgreementLine",
        "municipalityImportanceOfEmissionSources",
      ]}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6">
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

      {/* Version Toggle */}
      <div className="flex justify-center mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewVersion(!showNewVersion)}
          className="bg-black-2 border-black-1 text-white hover:bg-black-1"
        >
          {showNewVersion ? "Show Original Version" : "Show New Version"}
        </Button>
      </div>

      {/* Chart Display */}
      <div className="mt-8 h-[400px]">
        {showNewVersion ? (
          <MunicipalityEmissionsGraphNew
            projectedData={emissionsData}
            sectorEmissions={sectorEmissions || undefined}
            dataView={dataView}
            hiddenSectors={hiddenSectors}
            setHiddenSectors={setHiddenSectors}
          />
        ) : (
          <MunicipalityEmissionsGraph
            projectedData={emissionsData}
            sectorEmissions={sectorEmissions || undefined}
            dataView={dataView}
            hiddenSectors={hiddenSectors}
            setHiddenSectors={setHiddenSectors}
          />
        )}
      </div>

      {/* Version Info */}
      {/* <div className="text-center text-sm text-grey mt-2">
        {showNewVersion ? (
          <span>🆕 New version using shared components</span>
        ) : (
          <span>📊 Original version</span>
        )}
      </div> */}
    </SectionWithHelp>
  );
};
