import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { MunicipalityEmissionsGraph } from "./emissionsGraph/MunicipalityEmissionsGraph";
import { MunicipalityEmissionsGraphNew } from "./emissionsGraph/MunicipalityEmissionsGraph-New";
import { DataPoint, SectorEmissions } from "@/types/municipality";
import { ChartHeader } from "@/components/charts";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { Button } from "@/components/ui/button";

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
      <ChartHeader
        title={t("municipalityDetailPage.emissionsDevelopment")}
        tooltipContent={t("municipalityDetailPage.emissionsDevelopmentTooltip")}
        unit={t("municipalityDetailPage.inTons")}
        dataView={dataView}
        setDataView={(value) => setDataView(value as "overview" | "sectors")}
        hasAdditionalData={hasSectorData}
        dataViewType="municipality"
      />

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
      <div className="mt-8 h-[450px]">
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
    </SectionWithHelp>
  );
};
