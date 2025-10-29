import { t } from "i18next";
import {
  useCompanyKPIs,
  CompanyKPIValue,
} from "@/hooks/companies/useCompanyKPIs";
import { DataSelector } from "@/components/layout/DataSelector";
import { BarChart3 } from "lucide-react";

interface CompanyDataSelectorProps {
  selectedKPI: CompanyKPIValue;
  onDataPointChange: (kpiValue: CompanyKPIValue) => void;
}

const CompanyDataSelector = ({
  selectedKPI,
  onDataPointChange,
}: CompanyDataSelectorProps) => {
  const companyKPIs = useCompanyKPIs();

  return (
    <DataSelector<CompanyKPIValue>
      label={t("companies.list.dataSelector.label")}
      selectedItem={selectedKPI}
      items={companyKPIs}
      onItemChange={onDataPointChange}
      getItemLabel={(kpi) => t(`companies.list.kpis.${kpi.key}.label`)}
      getItemKey={(kpi) => String(kpi.key)}
      getItemDescription={(kpi) =>
        kpi.description ? t(kpi.description) : undefined
      }
      getItemDetailedDescription={(kpi) =>
        t(`companies.list.kpis.${kpi.key}.detailedDescription`)
      }
      icon={<BarChart3 className="w-4 h-4" />}
    />
  );
};

export default CompanyDataSelector;
