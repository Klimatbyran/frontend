import { useTranslation } from "react-i18next";
import { KPIValue } from "@/types/rankings";
import type { Municipality } from "@/types/municipality";
import { cn } from "@/lib/utils";
import {
  Leaf,
  TrendingDown,
  ShoppingCart,
  FileCheck,
  Car,
  Zap,
  Bike,
} from "lucide-react";

const KPI_ICONS: Record<string, React.ReactNode> = {
  meetsParisGoal: <Leaf className="w-4 h-4" />,
  historicalEmissionChangePercent: <TrendingDown className="w-4 h-4" />,
  totalConsumptionEmission: <ShoppingCart className="w-4 h-4" />,
  climatePlan: <FileCheck className="w-4 h-4" />,
  electricCarChangePercent: <Car className="w-4 h-4" />,
  electricVehiclePerChargePoints: <Zap className="w-4 h-4" />,
  bicycleMetrePerCapita: <Bike className="w-4 h-4" />,
};

interface MunicipalityKPISelectorProps {
  selectedKPI: KPIValue<Municipality>;
  kpis: KPIValue<Municipality>[];
  onKPIChange: (kpi: KPIValue<Municipality>) => void;
}

export function MunicipalityKPISelector({
  selectedKPI,
  kpis,
  onKPIChange,
}: MunicipalityKPISelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 space-y-3">
      <p className="text-xs text-white/50 uppercase tracking-wider px-1">
        {t("municipalities.list.dataSelector.label")}
      </p>

      <div className="flex gap-2 flex-wrap">
        {kpis.map((kpi) => {
          const isSelected =
            String(kpi.key) === String(selectedKPI.key);
          const icon = KPI_ICONS[String(kpi.key)];
          return (
            <button
              key={String(kpi.key)}
              onClick={() => onKPIChange(kpi)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap",
                isSelected
                  ? "bg-blue-3/20 border-blue-3 text-blue-3 shadow-[0_0_12px_rgba(76,155,232,0.3)]"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white",
              )}
              title={kpi.description}
            >
              {icon}
              <span>{t(`municipalities.list.kpis.${String(kpi.key)}.label`)}</span>
            </button>
          );
        })}
      </div>

      {selectedKPI.description && (
        <p className="text-sm text-white/50 px-1 leading-relaxed">
          {selectedKPI.description}
        </p>
      )}
    </div>
  );
}
