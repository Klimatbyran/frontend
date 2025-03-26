import React from "react";
import { X } from "lucide-react";

interface DetailPopupProps {
  year: string;
  sector: string;
  scope1: number;
  scope2: number;
  scope3: number;
  onClose: () => void;
}

const DetailPopup: React.FC<DetailPopupProps> = ({
  year,
  sector,
  scope1,
  scope2,
  scope3,
  onClose,
}) => {
  const total = scope1 + scope2 + scope3;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black-2 border border-black-1 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-light text-white">
            {sector} - {year}
          </h3>
          <button
            onClick={onClose}
            className="text-grey hover:text-white focus:outline-none transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm text-grey mb-2">Total Emissions</h4>
            <p className="text-2xl font-light text-white">
              {total.toLocaleString()} tCO₂e
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey">Scope 1</span>
                <span className="text-sm text-white">
                  {scope1.toLocaleString()} tCO₂e
                </span>
              </div>
              <div className="h-2 bg-black-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-1 transition-all duration-500 ease-out"
                  style={{ width: `${(scope1 / total) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey">Scope 2</span>
                <span className="text-sm text-white">
                  {scope2.toLocaleString()} tCO₂e
                </span>
              </div>
              <div className="h-2 bg-black-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-2 transition-all duration-500 ease-out"
                  style={{ width: `${(scope2 / total) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey">Scope 3</span>
                <span className="text-sm text-white">
                  {scope3.toLocaleString()} tCO₂e
                </span>
              </div>
              <div className="h-2 bg-black-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-3 transition-all duration-500 ease-out"
                  style={{ width: `${(scope3 / total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPopup;
