import React from "react";
import { X } from "lucide-react";
import { TrendCardInfo } from "@/types/company";
import TrendCompanyList from "./TrendCompanyList";



interface TrendCardProps {
  category: "decreasing" | "increasing" | "noComparable";
  data: any[];
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
  info: TrendCardInfo;
  isMobile: boolean;
}

const TrendCard: React.FC<TrendCardProps> = ({
  category,
  data,
  isSelected,
  onSelect,
  onClose,
  info,
  isMobile,
}) => {
  const Icon = info.icon;

  return (
    <div
      className={`relative transition-all duration-300 ease-in-out ${
        isSelected && !isMobile ? "col-span-3" : ""
      } ${isSelected ? "h-[400px]" : "cursor-pointer hover:scale-105"}`}
      onClick={isSelected ? undefined : onSelect}
    >
      <div
        className={`
        bg-black-2 border border-black-1 rounded-lg p-6
        transition-all duration-300 ease-in-out
        ${isSelected ? "h-full overflow-hidden" : "flex flex-col items-center"}
      `}
      >
        {isSelected ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${info.color}`}>
                  <Icon className={`h-5 w-5 ${info.textColor}`} />
                </div>
                <h3 className="text-xl font-light text-white">{info.title}</h3>
                <span className="text-sm text-grey">({data.length})</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="text-grey hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <TrendCompanyList category={category} data={data} />
          </>
        ) : (
          <>
            <div className={`rounded-full p-3 ${info.color} mb-4`}>
              <Icon className={`h-6 w-6 ${info.textColor}`} />
            </div>
            <h3 className="text-2xl font-light text-white mb-2">
              {data.length}
            </h3>
            <p className="text-sm text-grey text-center">{info.title}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default TrendCard;
