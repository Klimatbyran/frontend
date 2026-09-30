import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { useLanguage } from "@/components/LanguageProvider";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import {
  formatEmissionsAbsolute,
  formatPercent,
} from "@/utils/formatting/localization";
import { yearFromIsoDate } from "@/utils/date";
import type { ReportingPeriod } from "@/types/company";
import { NestedScopeRings } from "./NestedScopeRings";
import { ScopeBreakdownBar } from "./ScopeBreakdownBar";
import {
  buildUnderstandingEmissionsModel,
  type GuideTab,
  type ScopeKey,
} from "./buildUnderstandingEmissionsModel";

type UnderstandingEmissionsProps = {
  companyName: string;
  selectedPeriod: ReportingPeriod;
};

const TABS: GuideTab[] = ["overview", "scope1", "scope2", "scope3"];

function formatScopeValue(
  value: number | null,
  language: "en" | "sv",
  notReported: string,
  unit: string,
): string {
  if (value == null) return notReported;
  return `${formatEmissionsAbsolute(value, language)} ${unit}`;
}

export function UnderstandingEmissions({
  companyName,
  selectedPeriod,
}: UnderstandingEmissionsProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { getCategoryName } = useCategoryMetadata();
  const [activeTab, setActiveTab] = useState<GuideTab>("overview");

  const year = yearFromIsoDate(selectedPeriod.endDate);
  const model = useMemo(
    () => buildUnderstandingEmissionsModel(selectedPeriod, year),
    [selectedPeriod, year],
  );

  if (!model.hasAnyScopeData) {
    return null;
  }

  const unit = t("emissionsUnit");
  const notReported = t("companies.understandingEmissions.notReported");

  const centerValueByTab: Record<GuideTab, string> = {
    overview: formatScopeValue(
      model.total ?? (model.knownScopeSum > 0 ? model.knownScopeSum : null),
      currentLanguage,
      notReported,
      unit,
    ),
    scope1: formatScopeValue(
      model.scope1,
      currentLanguage,
      notReported,
      unit,
    ),
    scope2: formatScopeValue(
      model.scope2,
      currentLanguage,
      notReported,
      unit,
    ),
    scope3: formatScopeValue(
      model.scope3,
      currentLanguage,
      notReported,
      unit,
    ),
  };

  const centerLabelByTab: Record<GuideTab, string> = {
    overview: t("companies.understandingEmissions.center.total", { year }),
    scope1: t("companies.understandingEmissions.center.scope1"),
    scope2: t("companies.understandingEmissions.center.scope2"),
    scope3: t("companies.understandingEmissions.center.scope3"),
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as GuideTab);
  };

  const handleSelectScope = (scope: ScopeKey) => {
    setActiveTab(scope);
  };

  return (
    <SectionWithHelp helpItems={["totalEmissions", "scope1", "scope2", "scope3"]}>
      <div className="space-y-6 md:space-y-8">
        <div className="max-w-3xl space-y-3">
          <Text variant="h3">
            {t("companies.understandingEmissions.title")}
          </Text>
          <Text className="text-lg text-grey md:text-xl">
            {t("companies.understandingEmissions.subtitle", {
              companyName,
              year,
            })}
          </Text>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-black-1 p-1">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 data-[state=active]:bg-black-2 data-[state=active]:text-white"
              >
                {t(`companies.understandingEmissions.tabs.${tab}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
            <NestedScopeRings
              activeTab={activeTab}
              scope1={model.scope1}
              scope2={model.scope2}
              scope3={model.scope3}
              centerLabel={centerLabelByTab[activeTab]}
              centerValue={centerValueByTab[activeTab]}
            />

            <div className="space-y-6">
              <ScopeBreakdownBar
                shares={model.shares}
                activeTab={activeTab}
                onSelectScope={handleSelectScope}
              />

              <TabsContent value="overview" className="mt-0 space-y-4">
                <Text className="text-xl md:text-2xl">
                  {t("companies.understandingEmissions.overview.headline")}
                </Text>
                <Text className="text-grey md:text-lg">
                  {t("companies.understandingEmissions.overview.body", {
                    companyName,
                    year,
                  })}
                </Text>
                <ul className="space-y-3 text-grey md:text-lg">
                  <li>
                    {t("companies.understandingEmissions.overview.bulletScope1")}
                  </li>
                  <li>
                    {t("companies.understandingEmissions.overview.bulletScope2")}
                  </li>
                  <li>
                    {t("companies.understandingEmissions.overview.bulletScope3")}
                  </li>
                </ul>
              </TabsContent>

              <TabsContent value="scope1" className="mt-0 space-y-4">
                <Text className="text-xl md:text-2xl">
                  {t("companies.understandingEmissions.scope1.headline")}
                </Text>
                <Text className="text-grey md:text-lg">
                  {t("companies.understandingEmissions.scope1.body", {
                    companyName,
                    value: centerValueByTab.scope1,
                    year,
                  })}
                </Text>
                <Text className="text-grey md:text-lg">
                  {t("companies.understandingEmissions.scope1.examples")}
                </Text>
              </TabsContent>

              <TabsContent value="scope2" className="mt-0 space-y-4">
                <Text className="text-xl md:text-2xl">
                  {t("companies.understandingEmissions.scope2.headline")}
                </Text>
                <Text className="text-grey md:text-lg">
                  {t("companies.understandingEmissions.scope2.body", {
                    companyName,
                    value: centerValueByTab.scope2,
                    year,
                  })}
                </Text>
                <Text className="text-grey md:text-lg">
                  {t("companies.understandingEmissions.scope2.examples")}
                </Text>
              </TabsContent>

              <TabsContent value="scope3" className="mt-0 space-y-4">
                <Text className="text-xl md:text-2xl">
                  {t("companies.understandingEmissions.scope3.headline")}
                </Text>
                <Text className="text-grey md:text-lg">
                  {t("companies.understandingEmissions.scope3.body", {
                    companyName,
                    value: centerValueByTab.scope3,
                    year,
                  })}
                </Text>

                {model.topScope3Categories.length > 0 ? (
                  <div className="space-y-3 rounded-lg bg-black-1 p-4 md:p-5">
                    <Text weight="medium">
                      {t(
                        "companies.understandingEmissions.scope3.driversTitle",
                      )}
                    </Text>
                    <ul className="space-y-3">
                      {model.topScope3Categories.map((driver) => (
                        <li
                          key={driver.category}
                          className="flex flex-wrap items-baseline justify-between gap-2 border-b border-black-2 pb-2 last:border-0 last:pb-0"
                        >
                          <span>
                            {getCategoryName(driver.category)}
                          </span>
                          <span className="text-grey">
                            {formatEmissionsAbsolute(
                              driver.total,
                              currentLanguage,
                            )}{" "}
                            {unit}
                            {driver.shareOfScope3 != null && (
                              <>
                                {" · "}
                                {formatPercent(
                                  driver.shareOfScope3,
                                  currentLanguage,
                                )}
                              </>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Text className="text-sm text-grey">
                      {t(
                        "companies.understandingEmissions.scope3.driversHint",
                      )}
                    </Text>
                  </div>
                ) : (
                  <Text className="text-grey md:text-lg">
                    {t(
                      "companies.understandingEmissions.scope3.noCategories",
                    )}
                  </Text>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </SectionWithHelp>
  );
}
