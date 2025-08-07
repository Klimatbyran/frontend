import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ExploreChart } from "./ExploreChart";
import { ChartData } from "@/types/emissions";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  // --- New logic for dynamic explore steps ---
  const hasDataBeforeBaseYear =
    companyBaseYear && data.some((d) => d.year < companyBaseYear);

  // Build steps dynamically
  const exploreSteps = [
    ...(hasDataBeforeBaseYear
      ? [
          {
            label: "Data before the base year",
            description: t(
              "companies.emissionsHistory.exploreStep0Description",
            ),
          },
        ]
      : []),
    {
      label: "Base year to latest reporting period",
      description:
        "This section highlights the period from the base year to the latest reported data.",
    },
    {
      label: "Approximated values",
      description:
        "Here we show the estimated values from the last reporting period to the current year.",
    },
    {
      label: "Projection outwards",
      description: "This step shows the future trend line projection.",
    },
    {
      label: "Paris line",
      description: "This step shows the Paris Agreement reduction path.",
    },
    {
      label: "Difference shading",
      description:
        "Red/green shading shows the difference between the trend and Paris lines, representing the tCO₂ gap.",
    },
    {
      label: "Total area analysis",
      description:
        "Shows the cumulative emissions difference over time. The total area between trend and Paris lines represents the overall impact from current year to 2050.",
    },
  ];

  // Set initial step based on whether the first step exists
  const initialExploreStep = 0;
  const [exploreStep, setExploreStep] = useState(initialExploreStep);

  return (
    <div className="flex flex-col w-full bg-black-2 rounded-lg p-6">
      {/* Placeholder for animated/segmented chart for each step */}
      <div className="mb-4 text-center">
        <div className="text-lg font-bold mb-2">
          {exploreSteps[exploreStep].label}
        </div>
        <div className="text-grey text-base mb-4">
          {exploreSteps[exploreStep].description}
        </div>
      </div>

      {/* Render the explore chart, only show step 0 if it exists */}
      <div className="w-full h-[350px] mb-8">
        <ExploreChart
          data={data}
          step={exploreStep + (hasDataBeforeBaseYear ? 0 : 1)}
          companyBaseYear={companyBaseYear}
          currentLanguage={currentLanguage}
          trendExplanation={
            exploreStep === 2 ? trendAnalysis?.explanation : undefined
          }
          yDomain={yDomain}
        />
      </div>

      {/* Button controls - always below chart, never overlapping */}
      <div className="flex flex-row gap-4 justify-center pt-12">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExploreStep((s) => Math.max(0, s - 1))}
          disabled={exploreStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setExploreStep((s) => Math.min(exploreSteps.length - 1, s + 1))
          }
          disabled={exploreStep === exploreSteps.length - 1}
        >
          Next
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
          Exit
        </Button>
      </div>
    </div>
  );
}
