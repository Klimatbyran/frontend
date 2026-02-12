import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChartData } from "@/types/emissions";
import { useScreenSize } from "@/hooks/useScreenSize";
import { generateApproximatedData } from "@/lib/calculations/trends/approximatedData";
import { CumulativeSummaryBoxes } from "./CumulativeSummaryBoxes";
import { ExploreChart } from "./ExploreChart";

interface ExploreModeProps {
  data: ChartData[];
  companyBaseYear?: number;
  currentLanguage: "sv" | "en";
  trendAnalysis?: {
    method: string;
    explanation: string;
    explanationParams?: Record<string, string | number>;
    coefficients?:
      | { slope: number; intercept: number }
      | { a: number; b: number };
    cleanData?: { year: number; value: number }[];
  } | null;
  yDomain: [number, number];
  onExit: () => void;
}

export function ExploreMode({
  data,
  companyBaseYear,
  currentLanguage,
  trendAnalysis,
  yDomain,
  onExit,
}: ExploreModeProps) {
  const { t, i18n } = useTranslation();
  const { isMobile } = useScreenSize();

  React.useEffect(() => {
    if (currentLanguage !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage, i18n]);

  const hasDataBeforeBaseYear =
    companyBaseYear && data.some((d) => d.year < companyBaseYear);

  const exploreSteps = [
    ...(hasDataBeforeBaseYear
      ? [
          {
            label: t("companies.emissionsHistory.exploreStep0Label"),
            description: t(
              "companies.emissionsHistory.exploreStep0Description",
            ),
          },
        ]
      : []),
    {
      label: t("companies.emissionsHistory.exploreStep1Label"),
      description: t("companies.emissionsHistory.exploreStep1Description"),
    },
    {
      label: t("companies.emissionsHistory.exploreStep2Label"),
      description: t("companies.emissionsHistory.exploreStep2Description"),
    },
    {
      label: t("companies.emissionsHistory.exploreStep3Label"),
      description: t("companies.emissionsHistory.exploreStep3Description"),
    },
    {
      label: t("companies.emissionsHistory.exploreStep4Label"),
      description: t("companies.emissionsHistory.exploreStep4Description"),
    },
    {
      label: t("companies.emissionsHistory.exploreStep5Label"),
      description: t("companies.emissionsHistory.exploreStep5Description"),
    },
  ];

  // Set initial step based on whether the first step exists
  const initialExploreStep = 0;
  const [exploreStep, setExploreStep] = useState(initialExploreStep);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(
    new Set(),
  );
  const [showCumulativeSummary, setShowCumulativeSummary] = useState(false);

  // Calculate step 5 data for mobile cumulative summary
  const step5Data = useMemo(() => {
    if (!companyBaseYear || !trendAnalysis?.coefficients || exploreStep !== 4)
      return [];

    const emissionsData = data
      .filter((d) => d.total !== undefined && d.total !== null)
      .map((d) => ({ year: d.year, total: d.total as number }));

    if (emissionsData.length < 2) return [];

    const endYear2050 = 2050;
    const parisStartYear = 2025;

    const approximatedData = generateApproximatedData(
      data,
      endYear2050,
      trendAnalysis.coefficients,
    );

    if (!approximatedData) return [];

    // Build step 5 data array from 2025 to 2050
    const step5AreaData: {
      year: number;
      approximated: number;
      carbonLaw: number;
      areaDiff: number;
    }[] = [];
    for (let year = parisStartYear; year <= endYear2050; year++) {
      const trendPoint = approximatedData.find((d) => d.year === year);
      const trendValue = trendPoint?.approximated;
      const parisValue = trendPoint?.carbonLaw;

      if (typeof trendValue === "number" && typeof parisValue === "number") {
        const areaDiff = trendValue - parisValue;
        step5AreaData.push({
          year,
          approximated: trendValue,
          carbonLaw: parisValue,
          areaDiff: areaDiff,
        });
      }
    }

    return step5AreaData;
  }, [data, companyBaseYear, trendAnalysis, exploreStep]);

  const toggleDescription = (step: number) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(step)) {
        newSet.delete(step);
      } else {
        newSet.add(step);
      }
      return newSet;
    });
  };

  const toggleCumulativeSummary = () => {
    setShowCumulativeSummary(!showCumulativeSummary);
  };

  useEffect(() => {
    setExpandedDescriptions(new Set());
    setShowCumulativeSummary(false);
  }, [exploreStep]);

  return (
    <div
      className={`flex flex-col w-full bg-black-2 rounded-lg ${isMobile ? "p-3" : "p-6"}`}
    >
      {/* Placeholder for animated/segmented chart for each step */}
      <div className="mb-4 text-center">
        <div className="text-lg font-bold mb-2">
          {exploreSteps[exploreStep].label}
        </div>
        <div className={`text-grey text-base ${isMobile ? "mb-2" : "mb-4"}`}>
          {isMobile ? (
            <div>
              <button
                className="bg-black-1 text-white px-3 py-1 rounded-md mt-1 text-sm"
                onClick={() => toggleDescription(exploreStep)}
              >
                {expandedDescriptions.has(exploreStep)
                  ? t("companies.overview.readLess")
                  : t("companies.overview.readMore")}
              </button>
              {expandedDescriptions.has(exploreStep) && (
                <div className="max-w-2xl mx-auto mt-2">
                  {exploreSteps[exploreStep].description}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {exploreSteps[exploreStep].description}
            </div>
          )}
        </div>
      </div>

      {/* Render the explore chart, only show step 0 if it exists */}
      <div
        className={`w-full ${isMobile ? "h-[400px] mb-2" : "h-[350px] mb-8"}`}
      >
        <ExploreChart
          data={data}
          step={exploreStep + (hasDataBeforeBaseYear ? 0 : 1)}
          companyBaseYear={companyBaseYear}
          currentLanguage={currentLanguage}
          trendExplanation={
            exploreStep === 2
              ? trendAnalysis?.explanation
                ? trendAnalysis.explanationParams
                  ? t(
                      trendAnalysis.explanation,
                      trendAnalysis.explanationParams,
                    )
                  : t(trendAnalysis.explanation)
                : t("companies.emissionsHistory.trendExplanationFallback")
              : undefined
          }
          yDomain={yDomain}
          trendAnalysis={trendAnalysis}
        />
      </div>

      {/* Mobile-only expandable cumulative summary for step 5 */}
      {isMobile && exploreStep === 4 && (
        <div className="text-center">
          <button
            className="bg-black-1 text-white px-3 py-1 rounded-md text-sm"
            onClick={toggleCumulativeSummary}
          >
            {showCumulativeSummary
              ? "Hide Cumulative Impact Summary"
              : "Show Cumulative Impact Summary"}
          </button>
          {showCumulativeSummary && (
            <div className="mt-3">
              <CumulativeSummaryBoxes
                step5Data={step5Data}
                currentLanguage={currentLanguage}
              />
            </div>
          )}
        </div>
      )}

      {/* Button controls - below chart */}
      <div
        className={`flex flex-row gap-4 justify-center relative z-50 ${isMobile ? "pt-6" : "pt-12"}`}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExploreStep((s) => Math.max(0, s - 1))}
          disabled={exploreStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("companies.emissionsHistory.exploreBackButton")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setExploreStep((s) => Math.min(exploreSteps.length - 1, s + 1))
          }
          disabled={exploreStep === exploreSteps.length - 1}
        >
          {t("companies.emissionsHistory.exploreNextButton")}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onExit();
            setExploreStep(initialExploreStep);
          }}
          className="ml-2"
        >
          {t("companies.emissionsHistory.exploreExitButton")}
        </Button>
      </div>
    </div>
  );
}
