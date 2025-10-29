import { t } from "i18next";
import { useMunicipalityKPIs } from "../../../hooks/municipalities/useMunicipalityKPIs";
import { DataSelector } from "@/components/layout/DataSelector";
import { BarChart3 } from "lucide-react";
import { KPIValue } from "@/types/entity-rankings";
import type { Municipality } from "@/types/municipality";

interface MunicipalityDataSelectorProps {
  selectedKPI: KPIValue<Municipality>;
  onDataPointChange: (kpiValue: KPIValue<Municipality>) => void;
}

const MunicipalityDataSelector = ({
  selectedKPI,
  onDataPointChange,
}: MunicipalityDataSelectorProps) => {
  const municipalityKPIs = useMunicipalityKPIs();

  return (
    <DataSelector<KPIValue<Municipality>>
      label={t("municipalities.list.dataSelector.label")}
      selectedItem={selectedKPI}
      items={municipalityKPIs}
      onItemChange={onDataPointChange}
      getItemLabel={(kpi) =>
        t(`municipalities.list.kpis.${String(kpi.key)}.label`)
      }
      getItemKey={(kpi) => String(kpi.key)}
      getItemDescription={(kpi) =>
        kpi.description ? t(kpi.description) : undefined
      }
      getItemDetailedDescription={(kpi) =>
        t(`municipalities.list.kpis.${String(kpi.key)}.detailedDescription`)
      }
      icon={<BarChart3 className="w-4 h-4" />}
    />
  );
};

export default MunicipalityDataSelector;
