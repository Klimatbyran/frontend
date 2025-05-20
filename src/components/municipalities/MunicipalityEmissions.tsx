import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { MunicipalityEmissionsGraph } from "./MunicipalityEmissionsGraph";
import { Municipality, DataPoint, SectorEmissions } from "@/types/municipality";
import { DataViewSelector } from "./DataViewSelector";

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
    <div className={cn("bg-black-2 rounded-level-1 py-8 md:py-16", className)}>
      <div className="px-8 md:px-16">
        <Text className="text-2xl md:text-4xl">
          {t("municipalityDetailPage.emissionsDevelopment")}
        </Text>
        <Text className="text-grey">{t("municipalityDetailPage.inTons")}</Text>
        {!municipality.neededEmissionChangePercent && (
          <p className="my-4">{t("municipalityDetailPage.noParisPath")}</p>
        )}
      </div>

      <div className="mt-8 h-[400px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-12 gap-4 md:gap-0 px-8">
          <DataViewSelector
            dataView={dataView}
            setDataView={setDataView}
            hasSectorData={hasSectorData}
          />
        </div>

        <div className="mr-8">
          <MunicipalityEmissionsGraph
            projectedData={emissionsData}
            sectorEmissions={sectorEmissions || undefined}
            dataView={dataView}
            hiddenSectors={hiddenSectors}
            setHiddenSectors={setHiddenSectors}
          />
        </div>
      </div>
    </div>
  );
};
