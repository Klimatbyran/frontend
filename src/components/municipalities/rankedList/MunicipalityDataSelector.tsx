import React, { useEffect, useRef } from "react";
import { BarChart3, ChevronDown } from "lucide-react";
import { t } from "i18next";
import { useMunicipalityKPIs } from "../../../hooks/useMunicipalityKPIs";
import { KPIValue } from "@/types/municipality";

interface DataSelectorProps {
  selectedDataPoint: KPIValue;
  onDataPointChange: (dataPoint: KPIValue) => void;
}

const DataSelector = ({
  selectedDataPoint,
  onDataPointChange,
}: DataSelectorProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const municipalityKPIs = useMunicipalityKPIs();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

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
              {t(
                `municipalities.list.dataSelector.dataPoints.${selectedDataPoint.key}.label`,
              )}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-white transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-black-1 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm">
              {municipalityKPIs.map((dataPoint) => (
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
                      {t(dataPoint.description)}
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
};

export default DataSelector;
