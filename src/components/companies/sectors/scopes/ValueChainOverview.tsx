import React, { useState } from "react";
import {
  Truck,
  Factory,
  ShoppingBag,
  ArrowDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";

interface StageDetails {
  title: string;
  icon: React.ElementType;
  color: string;
  description: string;
  details: string[];
}

const ValueChainOverview: React.FC = () => {
  const { isMobile, isTablet } = useScreenSize();
  const { t } = useTranslation();
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  const stages: StageDetails[] = [
    {
      title: t("companiesPage.sectorGraphs.upstream"),
      icon: Truck,
      color: "text-blue-3",
      description: t("companiesPage.sectorGraphs.upstreamDescription"),
      details: [
        t("companiesPage.sectorGraphs.rawMaterialExtraction"),
        t("companiesPage.sectorGraphs.transportationOfMaterials"),
        t("companiesPage.sectorGraphs.supplierManufacturing"),
        t("companiesPage.sectorGraphs.packagingProduction"),
      ],
    },
    {
      title: t("companiesPage.sectorGraphs.operations"),
      icon: Factory,
      color: "text-orange-3",
      description: t("companiesPage.sectorGraphs.operationsDescription"),
      details: [
        t("companiesPage.sectorGraphs.manufacturingProcesses"),
        t("companiesPage.sectorGraphs.facilityOperations"),
        t("companiesPage.sectorGraphs.companyVehicles"),
        t("companiesPage.sectorGraphs.onSiteEnergyUse"),
      ],
    },
    {
      title: t("companiesPage.sectorGraphs.downstream"),
      icon: ShoppingBag,
      color: "text-green-3",
      description: t("companiesPage.sectorGraphs.downstreamDescription"),
      details: [
        t("companiesPage.sectorGraphs.productDistribution"),
        t("companiesPage.sectorGraphs.consumerUsage"),
        t("companiesPage.sectorGraphs.productDisposal"),
        t("companiesPage.sectorGraphs.recyclingProcesses"),
      ],
    },
  ];

  if (isMobile) {
    return (
      <div className="bg-black-2 rounded-lg p-4">
        <h3 className="text-base font-light text-white mb-3">
          {t("companiesPage.sectorGraphs.valueChainOverview")}
        </h3>

        <div className="space-y-2">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isSelected = selectedStage === index;

            return (
              <div key={index} className="relative">
                <button
                  onClick={() => setSelectedStage(isSelected ? null : index)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isSelected ? "bg-black-1" : "bg-black-1/50 hover:bg-black-1"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 bg-black-2`}>
                      <Icon className={`h-4 w-4 ${stage.color}`} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">
                        {stage.title}
                      </div>
                      <div className="text-xs text-grey">
                        {stage.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 text-grey transition-transform ${
                      isSelected ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {isSelected && (
                  <div className="mt-2 ml-12 space-y-2 animate-fadeIn">
                    {stage.details.map((detail, i) => (
                      <div
                        key={i}
                        className="text-xs text-grey flex items-center gap-2 p-2 bg-black-2 rounded"
                      >
                        <div
                          className={`w-1 h-1 rounded-full ${stage.color.replace(
                            "text-",
                            "bg-",
                          )}`}
                        />
                        {detail}
                      </div>
                    ))}
                  </div>
                )}

                {index < stages.length - 1 && !isSelected && (
                  <div className="flex justify-center h-4 my-1">
                    <ArrowDown className="h-3 w-3 text-grey" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className="bg-black-2 rounded-lg p-6">
        <h3 className="text-lg font-light text-white mb-4">
          {t("companiesPage.sectorGraphs.valueChainOverview")}
        </h3>
        <div className="flex flex-col space-y-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isLast = index === stages.length - 1;

            return (
              <div key={index} className="relative">
                <div className="bg-black-1 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`rounded-full p-2 bg-black-2 shrink-0`}>
                      <Icon className={`h-5 w-5 ${stage.color}`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {stage.title}
                      </div>
                      <div className="text-xs text-grey">
                        {stage.description}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {stage.details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div
                          className={`w-1 h-1 rounded-full shrink-0 mt-1.5 ${stage.color.replace(
                            "text-",
                            "bg-",
                          )}`}
                        />
                        <span className="text-xs text-grey">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {!isLast && (
                  <div className="flex justify-center h-6">
                    <ArrowDown className="h-4 w-4 text-grey" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black-2 rounded-lg p-6">
      <h3 className="text-lg font-light text-white mb-4">
        {t("companiesPage.sectorGraphs.valueChainOverview")}
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isLast = index === stages.length - 1;

          return (
            <div key={index} className="relative">
              <div className="bg-black-1 rounded-lg p-4 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`rounded-full p-2 bg-black-2 shrink-0`}>
                    <Icon className={`h-5 w-5 ${stage.color}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {stage.title}
                    </div>
                    <div className="text-xs text-grey">{stage.description}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {stage.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div
                        className={`w-1 h-1 rounded-full shrink-0 mt-1.5 ${stage.color.replace(
                          "text-",
                          "bg-",
                        )}`}
                      />
                      <span className="text-xs text-grey">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
              {!isLast && (
                <div className="absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="h-4 w-4 text-grey" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ValueChainOverview;
