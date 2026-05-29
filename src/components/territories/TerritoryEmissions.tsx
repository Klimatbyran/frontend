import { FC } from "react";
import { useTranslation } from "react-i18next";
import { DataPoint, NationDataPoint, SectorEmissions } from "@/types/emissions";
import {
  getDynamicChartHeight,
  useDataView,
  useHiddenItems,
  useMunicipalityViewOptions,
} from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { TerritoryEmissionsGraph } from "./emissionsGraph/TerritoryEmissionsGraph";

type DataView = "overview" | "sectors";

interface TerritoryEmissionsProps {
  emissionsData: DataPoint[] | NationDataPoint[];
  sectorEmissions: SectorEmissions | null;
  className?: string;
  stackedOverview?: boolean;
}

export const TerritoryEmissions: FC<TerritoryEmissionsProps> = ({
  emissionsData,
  sectorEmissions,
  stackedOverview = false,
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

  const municipalityViewOptions = useMunicipalityViewOptions(hasSectorData);
  const dataViewOptions = stackedOverview ? [] : municipalityViewOptions;
  const activeDataView: DataView = stackedOverview ? "overview" : dataView;

  return (
    <SectionWithHelp
      helpItems={[
        "parisAgreementLine",
        ...(stackedOverview
          ? []
          : (["municipalityImportanceOfEmissionSources"] as const)),
      ]}
    >
      <CardHeader
        title={t("detailPage.emissionsDevelopment")}
        unit={t("detailPage.inTons")}
        {...(!stackedOverview && {
          dataView,
          setDataView: (value: string) =>
            setDataView(value as "overview" | "sectors"),
          dataViewOptions,
          dataViewPlaceholder: t("municipalities.graph.selectView"),
        })}
      />
      <div
        className="mt-8"
        style={{ height: getDynamicChartHeight(activeDataView, false) }}
      >
        <TerritoryEmissionsGraph
          projectedData={emissionsData}
          sectorEmissions={sectorEmissions || undefined}
          dataView={activeDataView}
          hiddenSectors={hiddenSectors}
          setHiddenSectors={setHiddenSectors}
          stackedOverview={stackedOverview}
        />
      </div>
    </SectionWithHelp>
  );
};
