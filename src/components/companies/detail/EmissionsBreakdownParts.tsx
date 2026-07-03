import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { localizeUnit } from "@/utils/formatting/localization";
import { AiIcon } from "@/components/ui/ai-icon";
import { CardHeader } from "@/components/layout/CardHeader";
import { InfoTooltip } from "@/components/layout/InfoTooltip";

export interface Scope3Category {
  category: number;
  total: number;
  unit: string;
  metadata?: {
    verifiedBy?: { name: string } | null;
    user?: { name?: string } | null;
  };
}

interface ScopeDataItem {
  name: string;
  value: number;
  description: string;
  color: string;
}

interface ScopeOverviewGridProps {
  scopeData: ScopeDataItem[];
  totalEmissions: number;
}

export function ScopeOverviewGrid({
  scopeData,
  totalEmissions,
}: ScopeOverviewGridProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-8 mb-16">
      {scopeData.map((scope) => (
        <div
          key={scope.name}
          className="bg-black-1 rounded-level-2 p-8 space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className={cn("w-3 h-3 rounded-full", scope.color)} />
            <Text variant="body">{scope.name}</Text>
          </div>

          <Text className="text-4xl font-light">
            {scope.value.toLocaleString()}
            <span className="text-sm text-grey ml-2">
              {t("emissionsBreakdown.unit")}
            </span>
          </Text>

          <div className="h-2 bg-black-2 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", scope.color)}
              style={{
                width: `${(scope.value / totalEmissions) * 100}%`,
              }}
            />
          </div>

          <Text variant="body" className="text-sm">
            {scope.description}
          </Text>
        </div>
      ))}
    </div>
  );
}

interface Scope3CategoryItemProps {
  categoryId: number;
  reportedCategory?: Scope3Category;
  getCategoryName: (categoryId: number) => string;
  getCategoryDescription: (categoryId: number) => string;
  getCategoryIcon: (categoryId: number) => ComponentType<{
    className?: string;
  }>;
  currentLanguage: string;
  isAIGenerated: (category: Scope3Category) => boolean;
}

function Scope3CategoryItem({
  categoryId,
  reportedCategory,
  getCategoryName,
  getCategoryDescription,
  getCategoryIcon,
  currentLanguage,
  isAIGenerated,
}: Scope3CategoryItemProps) {
  const { t } = useTranslation();
  const Icon = getCategoryIcon(categoryId);

  return (
    <div className="flex items-center gap-6 bg-black-1 rounded-level-2 p-6">
      <div className="w-12 h-12 rounded-full bg-blue-5/30 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-blue-2" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Text variant="body">
            {categoryId}. {getCategoryName(categoryId)}
          </Text>
          <InfoTooltip ariaLabel="Information about this emissions category">
            <p>{getCategoryDescription(categoryId)}</p>
          </InfoTooltip>
        </div>
        {reportedCategory && reportedCategory.total != null ? (
          <Text variant="body" className="text-blue-2">
            {localizeUnit(reportedCategory.total, currentLanguage)}
            <span className="text-sm text-grey ml-2">
              {reportedCategory.unit}
            </span>
            {isAIGenerated(reportedCategory) && (
              <span className="ml-2">
                <AiIcon size="sm" />
              </span>
            )}
          </Text>
        ) : (
          <Text variant="body" className="text-grey">
            {t("emissionsBreakdown.notReported")}
          </Text>
        )}
      </div>
    </div>
  );
}

interface Scope3CategoriesSectionProps {
  scope3Categories: Scope3Category[];
  upstreamCategories: number[];
  downstreamCategories: number[];
  getCategoryName: (categoryId: number) => string;
  getCategoryDescription: (categoryId: number) => string;
  getCategoryIcon: (categoryId: number) => ComponentType<{
    className?: string;
  }>;
  currentLanguage: string;
  isAIGenerated: (category: Scope3Category) => boolean;
  isMobile: boolean;
  showOnlyScope3: boolean;
}

export function Scope3CategoriesSection({
  scope3Categories,
  upstreamCategories,
  downstreamCategories,
  getCategoryName,
  getCategoryDescription,
  getCategoryIcon,
  currentLanguage,
  isAIGenerated,
  isMobile,
  showOnlyScope3,
}: Scope3CategoriesSectionProps) {
  const { t } = useTranslation();

  if (scope3Categories.length === 0) {
    return null;
  }

  const renderCategoryList = (categoryIds: number[]) => (
    <div className="space-y-4">
      {categoryIds.map((categoryId) => (
        <Scope3CategoryItem
          key={categoryId}
          categoryId={categoryId}
          reportedCategory={scope3Categories.find(
            (category) => category.category === categoryId,
          )}
          getCategoryName={getCategoryName}
          getCategoryDescription={getCategoryDescription}
          getCategoryIcon={getCategoryIcon}
          currentLanguage={currentLanguage}
          isAIGenerated={isAIGenerated}
        />
      ))}
    </div>
  );

  return (
    <div className={cn(!showOnlyScope3 && "mt-16", "space-y-8")}>
      {!showOnlyScope3 && (
        <Text variant="h4">{t("emissionsBreakdown.scope3Categories")}</Text>
      )}

      <div
        className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-16`}
      >
        <div className="space-y-8">
          <Text variant="h5" className="text-grey">
            {t("emissionsBreakdown.upstream")}
          </Text>
          {renderCategoryList(upstreamCategories)}
        </div>

        <div className="space-y-8">
          <Text variant="h5" className="text-grey">
            {t("emissionsBreakdown.downstream")}
          </Text>
          {renderCategoryList(downstreamCategories)}
        </div>
      </div>
    </div>
  );
}

interface EmissionsBreakdownHeaderProps {
  year: number;
}

export function EmissionsBreakdownHeader({
  year,
}: EmissionsBreakdownHeaderProps) {
  const { t } = useTranslation();

  return (
    <CardHeader
      title={t("emissionsBreakdown.title", { year })}
      tooltipContent={t("emissionsBreakdown.tooltip")}
      className="mb-12"
    />
  );
}

interface BiogenicEmissionsCardProps {
  total: number;
  unit: string;
}

export function BiogenicEmissionsCard({
  total,
  unit,
}: BiogenicEmissionsCardProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-8 p-6 bg-black-1 rounded-level-2">
      <div className="flex items-center gap-2">
        <Text variant="h4">{t("emissionsBreakdown.biogenicEmissions")}</Text>
        <InfoTooltip ariaLabel="Information about biogenic emissions">
          <p>{t("scope.biogenic")}</p>
        </InfoTooltip>
      </div>
      <Text variant="body" className="mt-2">
        {total.toLocaleString()}
        <span className="text-sm text-grey ml-2">{unit}</span>
      </Text>
    </div>
  );
}
