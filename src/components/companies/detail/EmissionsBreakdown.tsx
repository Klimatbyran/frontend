import { Info } from "lucide-react";
import { Text } from "@/components/ui/text";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useCategoryMetadata } from "@/hooks/useCategories";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeUnit } from "@/utils/localizeUnit";

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
      }>;
    } | null;
    biogenicEmissions?: { total: number; unit: string } | null;
    calculatedTotalEmissions: number;
  } | null;
  year: number;
  className?: string;
  showOnlyScope3?: boolean;
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
  const isMobile = useScreenSize();
  const { currentLanguage } = useLanguage();

  if (!emissions) return null;

  const scopeData = [
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

  const totalEmissions = scopeData.reduce((sum, scope) => sum + scope.value, 0);
  const scope3Categories = emissions.scope3?.categories || [];

  return (
    <div className={cn("bg-black-2 rounded-level-1", className)}>
      {!showOnlyScope3 && (
        <>
          <div className="flex items-center gap-2 mb-12">
            <Text variant="h3">{t("emissionsBreakdown.title", { year })}</Text>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-grey" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("emissionsBreakdown.tooltip")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

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
        </>
      )}

      {/* Scope 3 Categories */}
      {scope3Categories.length > 0 && (
        <div className={cn(!showOnlyScope3 && "mt-16", "space-y-8")}>
          {!showOnlyScope3 && (
            <Text variant="h4">{t("emissionsBreakdown.scope3Categories")}</Text>
          )}

          <div
            className={`grid ${
              isMobile ? "grid-cols-1" : "grid-cols-2"
            } gap-16`}
          >
            {/* Upstream Categories */}
            <div className="space-y-8">
              <Text variant="h5" className="text-grey">
                {t("emissionsBreakdown.upstream")}
              </Text>
              <div className="space-y-4">
                {upstreamCategories.map((categoryId) => {
                  const reportedCategory = scope3Categories.find(
                    (c) => c.category === categoryId
                  );
                  const Icon = getCategoryIcon(categoryId);

                  return (
                    <div
                      key={categoryId}
                      className="flex items-center gap-6 bg-black-1 rounded-level-2 p-6"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-5/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-2" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Text variant="body">
                            {categoryId}. {getCategoryName(categoryId)}
                          </Text>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-4 h-4 text-grey" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getCategoryDescription(categoryId)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {reportedCategory ? (
                          <Text variant="body" className="text-blue-2">
                            {localizeUnit(reportedCategory.total, currentLanguage)}
                            <span className="text-sm text-grey ml-2">
                              {reportedCategory.unit}
                            </span>
                          </Text>
                        ) : (
                          <Text variant="body" className="text-grey">
                            {t("emissionsBreakdown.notReported")}
                          </Text>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Downstream Categories */}
            <div className="space-y-8">
              <Text variant="h5" className="text-grey">
                {t("emissionsBreakdown.downstream")}
              </Text>
              <div className="space-y-4">
                {downstreamCategories.map((categoryId) => {
                  const reportedCategory = scope3Categories.find(
                    (c) => c.category === categoryId
                  );
                  const Icon = getCategoryIcon(categoryId);

                  return (
                    <div
                      key={categoryId}
                      className="flex items-center gap-6 bg-black-1 rounded-level-2 p-6"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-5/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-2" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Text variant="body">
                            {categoryId}. {getCategoryName(categoryId)}
                          </Text>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-4 h-4 text-grey" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getCategoryDescription(categoryId)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {reportedCategory ? (
                          <Text variant="body" className="text-blue-2">
                            {localizeUnit(reportedCategory.total, currentLanguage)}
                            <span className="text-sm text-grey ml-2">
                              {reportedCategory.unit}
                            </span>
                          </Text>
                        ) : (
                          <Text variant="body" className="text-grey">
                            {t("emissionsBreakdown.notReported")}
                          </Text>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {emissions.biogenicEmissions && (
        <div className="mt-8 p-6 bg-black-1 rounded-level-2">
          <div className="flex items-center gap-2">
            <Text variant="h4">
              {t("emissionsBreakdown.biogenicEmissions")}
            </Text>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-grey" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("scope.biogenic")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Text variant="body" className="mt-2">
            {emissions.biogenicEmissions.total.toLocaleString()}
            <span className="text-sm text-grey ml-2">
              {emissions.biogenicEmissions.unit}
            </span>
          </Text>
        </div>
      )}
    </div>
  );
}
