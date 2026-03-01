import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ChartMode } from "@/hooks/charts/useChartState";

interface ChartModeSelectorProps {
  chartMode: ChartMode;
  setChartMode: (mode: ChartMode) => void;
}

export const ChartModeSelector: React.FC<ChartModeSelectorProps> = ({
  chartMode,
  setChartMode,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center">
      <Select
        value={chartMode}
        onValueChange={(value) => setChartMode(value as ChartMode)}
      >
        <SelectTrigger className="w-fit h-auto p-0 bg-transparent border-none shadow-none focus:ring-0 text-grey italic gap-1 flex items-center hover:text-white transition-colors">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-black-1 border-gray-800 text-white">
          <SelectItem value="absolute">
            {t("companies.emissionsHistory.unit")}
          </SelectItem>
          <SelectItem value="revenueIntensity">
            {t("companies.emissionsHistory.intensityUnit")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
