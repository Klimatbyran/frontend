import { t } from "i18next";
import { useMunicipalityKPIs } from "../../../hooks/municipalities/useMunicipalityKPIs";
import { DataSelector } from "@/components/layout/DataSelector";
import { BarChart3 } from "lucide-react";
import { KPIValue } from "@/types/entity-rankings";
interface MunicipalityDataSelectorProps {
  selectedKPI: KPIValue;
  onDataPointChange: (kpiValue: KPIValue) => void;
}

const MunicipalityDataSelector = ({
  selectedKPI,
  onDataPointChange,
}: MunicipalityDataSelectorProps) => {
  const municipalityKPIs = useMunicipalityKPIs();

  return (
    <DataSelector<KPIValue>
      label={t("municipalities.list.dataSelector.label")}
      selectedItem={selectedKPI}
      items={municipalityKPIs}
      onItemChange={onDataPointChange}
      getItemLabel={(kpi) => t(`municipalities.list.kpis.${kpi.key}.label`)}
      getItemKey={(kpi) => kpi.key}
      getItemDescription={(kpi) =>
        kpi.description ? t(kpi.description) : undefined
      }
      getItemDetailedDescription={(kpi) =>
        t(`municipalities.list.kpis.${kpi.key}.detailedDescription`)
      }
      icon={<BarChart3 className="w-4 h-4" />}
    />
  );
};

export default MunicipalityDataSelector;
