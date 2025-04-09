import React, { useEffect, useRef } from "react";
import { BarChart3, ChevronDown } from "lucide-react";
import { t } from "i18next";
import { Municipality } from "@/types/municipality";

interface DataPoint {
  label: string;
  key: keyof Municipality;
  unit: string;
  description?: string;
  higherIsBetter: boolean;
}

interface DataSelectorProps {
  selectedDataPoint: DataPoint;
  onDataPointChange: (dataPoint: DataPoint) => void;
}

export const dataPoints: DataPoint[] = [
  {
    label: t(
      "municipalities.list.dataSelector.dataPoints.historicalEmissionChange.label",
    ),
    key: "historicalEmissionChangePercent",
    unit: "%",
    description: t(
      "dataSelector.dataPoints.historicalEmissionChange.description",
    ),
    higherIsBetter: false,
  },
  {
    label: t(
      "municipalities.list.dataSelector.dataPoints.requiredEmissionChange.label",
    ),
    key: "neededEmissionChangePercent",
    unit: "%",
    description: t(
      "dataSelector.dataPoints.requiredEmissionChange.description",
    ),
    higherIsBetter: false,
  },
  {
    label: t(
      "municipalities.list.dataSelector.dataPoints.electricCarGrowth.label",
    ),
    key: "electricCarChangePercent",
    unit: "%",
    description: t(
      "municipalities.list.dataSelector.dataPoints.electricCarGrowth.description",
    ),
    higherIsBetter: true,
  },
  {
    label: t(
      "municipalities.list.dataSelector.dataPoints.totalConsumptionEmission.label",
    ),
    key: "totalConsumptionEmission",
    unit: "t",
    description: t(
      "dataSelector.dataPoints.totalConsumptionEmission.description",
    ),
    higherIsBetter: false,
  },
  {
    label: t(
      "municipalities.list.dataSelector.dataPoints.evsPerChargePoint.label",
    ),
    key: "electricVehiclePerChargePoints",
    unit: "",
    description: t(
      "municipalities.list.dataSelector.dataPoints.evsPerChargePoint.description",
    ),
    higherIsBetter: false,
  },
  {
    label: t(
      "municipalities.list.dataSelector.dataPoints.bicycleInfrastructure.label",
    ),
    key: "bicycleMetrePerCapita",
    unit: "m",
    description: t(
      "municipalities.list.dataSelector.dataPoints.bicycleInfrastructure.description",
    ),
    higherIsBetter: true,
  },
];

function DataSelector({
  selectedDataPoint,
  onDataPointChange,
}: DataSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-black-2 rounded-2xl p-4 mb-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-white/50" />
          <label className="text-sm font-medium text-white/50">
            {t("municipalities.list.dataSelector.label")}
          </label>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-black-1 text-white transition-colors"
          >
            <span className="text-left font-medium">
              {selectedDataPoint.label}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-white transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-black-1 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm">
              {dataPoints.map((dataPoint) => (
                <button
                  key={dataPoint.key}
                  onClick={() => {
                    onDataPointChange(dataPoint);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors
                    ${
                      selectedDataPoint.key === dataPoint.key
                        ? "bg-gray-700/80 text-blue-300"
                        : "text-white hover:bg-gray-700/80"
                    }
                  `}
                >
                  <span className="font-medium">{dataPoint.label}</span>
                  {dataPoint.description && (
                    <p className="text-xs text-white/50 mt-1">
                      {dataPoint.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataSelector;
