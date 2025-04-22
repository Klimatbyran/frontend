import { useState, useEffect } from "react";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { EmissionsChart } from "@/components/companies/detail/emissions-chart/EmissionsChart";
import { Text } from "@/components/ui/text";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Company } from "@/hooks/companies/useCompanies";

interface FeatureToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface TestCases {
  inconsistentScope3?: Company;
  zeroToReporting?: Company;
  missingYears?: Company;
  manyYearsReporting?: Company;
  noScope3?: Company;
  noEmissions?: Company;
}

function findTestCases(companies: Company[]): TestCases {
  return {
    // Company with inconsistent scope 3 reporting
    inconsistentScope3: companies.find((company) => {
      const scope3Reports = company.reportingPeriods.filter(
        (p) => p.emissions?.scope3?.categories?.length > 0,
      );
      const totalReports = company.reportingPeriods.length;
      return scope3Reports.length > 0 && scope3Reports.length < totalReports;
    }),

    // Company that starts with zero emissions
    zeroToReporting: companies.find((company) => {
      const periods = [...company.reportingPeriods].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );
      return (
        periods.length >= 3 &&
        periods[0].emissions?.calculatedTotalEmissions === 0 &&
        periods[periods.length - 1].emissions?.calculatedTotalEmissions > 0
      );
    }),

    // Company with gaps in reporting years
    missingYears: companies.find((company) => {
      const years = company.reportingPeriods
        .map((p) => new Date(p.startDate).getFullYear())
        .sort();
      return years.some((year, i) => i > 0 && year - years[i - 1] > 1);
    }),

    // Company with many years of consistent reporting
    manyYearsReporting: companies.find((company) => {
      const hasConsistentData = company.reportingPeriods.every(
        (p) =>
          p.emissions?.calculatedTotalEmissions > 0 &&
          p.emissions?.scope3?.categories?.length > 0,
      );
      return company.reportingPeriods.length >= 5 && hasConsistentData;
    }),

    // Company with no scope 3 data
    noScope3: companies.find(
      (company) =>
        company.reportingPeriods.length > 0 &&
        company.reportingPeriods.every(
          (p) =>
            p.emissions?.calculatedTotalEmissions > 0 &&
            !p.emissions?.scope3?.categories?.length,
        ),
    ),

    // Company with no emissions data
    noEmissions: companies.find(
      (company) =>
        company.reportingPeriods.length > 0 &&
        company.reportingPeriods.every(
          (p) => !p.emissions?.calculatedTotalEmissions,
        ),
    ),
  };
}

export function EmissionsTestPage() {
  const { companies, loading, error } = useCompanies();
  const testCases = findTestCases(companies);
  const [isFixed, setIsFixed] = useState(false);
  const [featureToggles, setFeatureToggles] = useState<FeatureToggle[]>([
    {
      id: "interpolateScope3",
      label: "Interpolate Scope 3",
      description:
        "Fill gaps in scope 3 reporting by interpolating between known values. This helps create smoother visualizations while clearly marking interpolated data points.",
      enabled: true,
    },
    {
      id: "guessBaseYear",
      label: "Smart Base Year",
      description:
        "Intelligently determine the base year by finding the first year with non-zero emissions rather than using the earliest year. This prevents skewed trends from initial zero-reporting years.",
      enabled: true,
    },
    {
      id: "compositeTrend",
      label: "Composite Trend Analysis",
      description:
        "Combine multiple trend calculation methods (linear regression, moving averages, recent change) with weighted importance to create a more robust trend line.",
      enabled: true,
    },
    {
      id: "outlierDetection",
      label: "Outlier Detection",
      description:
        "Detect and handle statistical outliers using the Median Absolute Deviation (MAD) method, which is more robust than standard deviation for non-normal distributions.",
      enabled: true,
    },
  ]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsFixed(scrollPosition > 280);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFeature = (id: string) => {
    setFeatureToggles((prev) =>
      prev.map((toggle) =>
        toggle.id === id ? { ...toggle, enabled: !toggle.enabled } : toggle,
      ),
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-16">
        <div className="h-12 w-1/3 bg-black-1 rounded" />
        <div className="h-96 bg-black-1 rounded-level-1" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <Text variant="h3" className="text-red-500 mb-4">
          Det gick inte att hämta företagsinformation
        </Text>
        <Text variant="muted">Försök igen senare</Text>
      </div>
    );
  }

  const renderTestCase = (
    title: string,
    description: string,
    company: Company | undefined,
  ) => (
    <div className="bg-black-2 rounded-level-2 p-8">
      <Text variant="h3" className="mb-4">
        {title}
      </Text>
      <Text variant="muted" className="mb-8">
        {description}
      </Text>
      {company ? (
        <div className="space-y-4">
          <Text variant="large">{company.name}</Text>
          <EmissionsChart
            reportingPeriods={company.reportingPeriods}
            className="bg-transparent p-0"
            features={{
              interpolateScope3:
                featureToggles.find((t) => t.id === "interpolateScope3")
                  ?.enabled || false,
              guessBaseYear:
                featureToggles.find((t) => t.id === "guessBaseYear")?.enabled ||
                false,
              compositeTrend:
                featureToggles.find((t) => t.id === "compositeTrend")
                  ?.enabled || false,
              outlierDetection:
                featureToggles.find((t) => t.id === "outlierDetection")
                  ?.enabled || false,
            }}
          />
        </div>
      ) : (
        <Text className="text-grey">No matching company found</Text>
      )}
    </div>
  );

  return (
    <div className="relative">
      {/* Initial Feature Toggles */}
      <div
        className={cn(
          "bg-black-3 transition-all duration-300",
          isFixed ? "h-[280px] invisible" : "h-auto visible",
        )}
      >
        <div className="max-w-[1400px] mx-auto p-8">
          <div className="space-y-4">
            <Text variant="h2">EmissionsHistory Test Cases</Text>
            <Text variant="muted">
              Testing edge cases and visualization methods for emissions data
            </Text>
          </div>

          <div className="mt-8 bg-black-2 rounded-level-2 p-8">
            <Text variant="h3" className="mb-8">
              Feature Toggles & Methods
            </Text>
            <div className="grid gap-8">
              {featureToggles.map((toggle) => (
                <div key={toggle.id} className="flex items-start space-x-4">
                  <Switch
                    id={`initial-${toggle.id}`}
                    checked={toggle.enabled}
                    onCheckedChange={() => toggleFeature(toggle.id)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={`initial-${toggle.id}`}>
                      {toggle.label}
                    </Label>
                    <Text variant="muted" className="text-sm">
                      {toggle.description}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Feature Toggles */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-black-3/95 backdrop-blur-sm transition-all duration-300",
          isFixed ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="max-w-[1400px] mx-auto p-4">
          <div className="flex items-center gap-8">
            <Text variant="h4">Feature Toggles</Text>
            <div className="flex flex-row gap-4">
              {featureToggles.map((toggle) => (
                <div key={toggle.id} className="flex items-center gap-2">
                  <Switch
                    id={`fixed-${toggle.id}`}
                    checked={toggle.enabled}
                    onCheckedChange={() => toggleFeature(toggle.id)}
                  />
                  <Label htmlFor={`fixed-${toggle.id}`} className="text-sm">
                    {toggle.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto space-y-24 p-8">
        {/* Edge Cases */}
        <div className="space-y-16">
          <Text variant="h3">Edge Cases</Text>
          <div className="space-y-8">
            {renderTestCase(
              "Inconsistent Scope 3 Reporting",
              "Company reports scope 3 emissions for some years but not all. Tests the interpolation and visualization of incomplete scope 3 data.",
              testCases.inconsistentScope3,
            )}

            {renderTestCase(
              "Zero to Active Reporting",
              "Company starts with zero emissions then begins reporting. Tests the handling of zero values and trend calculations.",
              testCases.zeroToReporting,
            )}

            {renderTestCase(
              "Missing Years",
              "Company has gaps in reporting years. Tests the visualization and trend calculation with incomplete time series.",
              testCases.missingYears,
            )}
          </div>
        </div>

        {/* Positive Cases */}
        <div className="space-y-16">
          <Text variant="h3">Positive Cases</Text>
          <div className="space-y-8">
            {renderTestCase(
              "Long Reporting History",
              "Company with many years of consistent reporting. Shows how the visualization handles larger datasets.",
              testCases.manyYearsReporting,
            )}

            {renderTestCase(
              "No Scope 3 Data",
              "Company that reports emissions but has no scope 3 data. Tests the handling of missing scope categories.",
              testCases.noScope3,
            )}

            {renderTestCase(
              "No Emissions Data",
              "Company with reporting periods but no emissions data. Tests the handling of completely missing data.",
              testCases.noEmissions,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
