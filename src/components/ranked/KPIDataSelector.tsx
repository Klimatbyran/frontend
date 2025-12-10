import { t } from "i18next";
import { DataSelector } from "@/components/layout/DataSelector";
import { BarChart3 } from "lucide-react";
import { KPIValue } from "@/types/entity-rankings";

interface KPIDataSelectorProps<T> {
  selectedKPI: KPIValue<T>;
  onKPIChange: (kpi: KPIValue<T>) => void;
  kpis: KPIValue<T>[];
  translationPrefix: string; // e.g., "companies.list" or "municipalities.list"
}

export function KPIDataSelector<T>({
  selectedKPI,
  onKPIChange,
  kpis,
  translationPrefix,
}: KPIDataSelectorProps<T>) {
  return (
    <DataSelector<KPIValue<T>>
      label={t(`${translationPrefix}.dataSelector.label`)}
      selectedItem={selectedKPI}
      items={kpis}
      onItemChange={onKPIChange}
      getItemLabel={(kpi) =>
        t(`${translationPrefix}.kpis.${String(kpi.key)}.label`)
      }
      getItemKey={(kpi) => String(kpi.key)}
      getItemDescription={(kpi) =>
        kpi.description ? t(kpi.description) : undefined
      }
      getItemDetailedDescription={(kpi) =>
        t(`${translationPrefix}.kpis.${String(kpi.key)}.detailedDescription`)
      }
      icon={<BarChart3 className="w-4 h-4" />}
    />
  );
}
