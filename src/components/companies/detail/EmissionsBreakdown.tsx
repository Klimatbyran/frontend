import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useLanguage } from "@/components/LanguageProvider";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import {
  BiogenicEmissionsCard,
  EmissionsBreakdownHeader,
  Scope3CategoriesSection,
  ScopeOverviewGrid,
} from "./EmissionsBreakdownParts";

interface EmissionsBreakdownProps {
  emissions: {
    scope1And2?: { total: number; unit: string } | null;
    scope1?: { total: number; unit: string } | null;
    scope2?: {
      calculatedTotalEmissions: number;
    } | null;
    scope3?: {
      total: number;
      unit: string;
      categories?: Array<{
        category: number;
        total: number;
        unit: string;
        metadata?: {
          verifiedBy?: { name: string } | null;
          user?: { name?: string } | null;
        };
      }>;
    } | null;
    biogenicEmissions?: { total: number; unit: string } | null;
    calculatedTotalEmissions: number;
  } | null;
  year: number;
  className?: string;
  showOnlyScope3?: boolean;
}

function buildScopeData(
  emissions: NonNullable<EmissionsBreakdownProps["emissions"]>,
  t: (key: string) => string,
) {
  return [
    {
      name: t("emissionsBreakdown.scope1"),
      value: emissions.scope1?.total || 0,
      description: t("scope.scope1"),
      color: "bg-orange-3",
    },
    {
      name: t("emissionsBreakdown.scope2"),
      value: emissions.scope2?.calculatedTotalEmissions || 0,
      description: t("scope.scope2"),
      color: "bg-pink-3",
    },
    {
      name: t("emissionsBreakdown.scope3"),
      value: emissions.scope3?.total || 0,
      description: t("scope.scope3"),
      color: "bg-blue-3",
    },
  ];
}

export function EmissionsBreakdown({
  emissions,
  year,
  className,
  showOnlyScope3 = false,
}: EmissionsBreakdownProps) {
  const { t } = useTranslation();
  const {
    getCategoryName,
    getCategoryDescription,
    getCategoryIcon,
    upstreamCategories,
    downstreamCategories,
  } = useCategoryMetadata();
  const { isMobile } = useScreenSize();
  const { currentLanguage } = useLanguage();
  const { isAIGenerated } = useVerificationStatus();

  if (!emissions) return null;

  const scopeData = buildScopeData(emissions, t);
  const totalEmissions = scopeData.reduce((sum, scope) => sum + scope.value, 0);
  const scope3Categories = emissions.scope3?.categories || [];

  return (
    <div className={cn("bg-black-2 rounded-level-1", className)}>
      {!showOnlyScope3 && (
        <>
          <EmissionsBreakdownHeader year={year} />
          <ScopeOverviewGrid
            scopeData={scopeData}
            totalEmissions={totalEmissions}
          />
        </>
      )}

      <Scope3CategoriesSection
        scope3Categories={scope3Categories}
        upstreamCategories={upstreamCategories}
        downstreamCategories={downstreamCategories}
        getCategoryName={getCategoryName}
        getCategoryDescription={getCategoryDescription}
        getCategoryIcon={getCategoryIcon}
        currentLanguage={currentLanguage}
        isAIGenerated={isAIGenerated}
        isMobile={isMobile}
        showOnlyScope3={showOnlyScope3}
      />

      {emissions.biogenicEmissions && (
        <BiogenicEmissionsCard
          total={emissions.biogenicEmissions.total}
          unit={emissions.biogenicEmissions.unit}
        />
      )}
    </div>
  );
}
