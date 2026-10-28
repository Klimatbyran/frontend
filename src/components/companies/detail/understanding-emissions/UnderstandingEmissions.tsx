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
import type {
  PageCompanyEmissionsHistory,
  PageCompanyScope3,
} from "@/types/pages";
import { OwnVsValueChainVisual } from "./OwnVsValueChainVisual";
import {
  buildUnderstandingEmissionsModel,
  formatSharePercentLabel,
  type EmissionsGroupKey,
  type GuideTab,
  type ScopeKey,
} from "./buildUnderstandingEmissionsModel";

type UnderstandingEmissionsProps = {
  companyName: string;
  year: number;
  totalEmissions: number | null;
  emissionsHistory?: PageCompanyEmissionsHistory;
  scope3?: PageCompanyScope3;
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

function periodForYear(
  history: PageCompanyEmissionsHistory | undefined,
  year: number,
) {
  return history?.periods.find((period) => period.year === year);
}

function scope3ForYear(
  scope3: PageCompanyScope3 | undefined,
  year: number,
): PageCompanyScope3 | undefined {
  if (!scope3 || scope3.year !== year) return undefined;
  return scope3;
}

export function UnderstandingEmissions({
  companyName,
  year,
  totalEmissions,
  emissionsHistory,
  scope3,
}: UnderstandingEmissionsProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { getCategoryName } = useCategoryMetadata();
  const [activeTab, setActiveTab] = useState<GuideTab>("overview");

  const yearLabel = String(year);
  const period = periodForYear(emissionsHistory, year);
  const matchingScope3 = scope3ForYear(scope3, year);

  const model = useMemo(() => {
    const scope1 = period?.scope1?.value ?? null;
    const scope2 = period?.scope2?.value ?? null;
    const scope3Total =
      period?.scope3?.value ?? matchingScope3?.calculatedTotalEmissions ?? null;

    const pageCategories = matchingScope3?.categories ?? [];
    const categories =
      pageCategories.length > 0
        ? pageCategories.map((category) => ({
            category: category.category,
            total: category.total,
          }))
        : period?.scope3Categories?.map((category) => ({
            category: category.category,
            total: category.value,
          }));

    return buildUnderstandingEmissionsModel({
      year: yearLabel,
      total: totalEmissions ?? period?.total ?? null,
      scope1,
      scope2,
      scope3: scope3Total,
      scope3Categories: categories,
    });
  }, [period, matchingScope3, totalEmissions, yearLabel]);

  if (!model.hasAnyScopeData) {
    return null;
  }

  const unit = t("emissionsUnit");
  const notReported = t("companies.understandingEmissions.notReported");

  const valueByTab: Record<GuideTab, string> = {
    overview: formatScopeValue(
      model.total ?? (model.knownScopeSum > 0 ? model.knownScopeSum : null),
      currentLanguage,
      notReported,
      unit,
    ),
    scope1: formatScopeValue(model.scope1, currentLanguage, notReported, unit),
    scope2: formatScopeValue(model.scope2, currentLanguage, notReported, unit),
    scope3: formatScopeValue(model.scope3, currentLanguage, notReported, unit),
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as GuideTab);
  };

  const handleSelectScope = (scope: ScopeKey) => {
    setActiveTab(scope);
  };

  const handleSelectGroup = (group: EmissionsGroupKey) => {
    if (group === "valueChain") {
      setActiveTab("scope3");
      return;
    }
    if (model.scope1 != null) {
      setActiveTab("scope1");
      return;
    }
    if (model.scope2 != null) {
      setActiveTab("scope2");
      return;
    }
    setActiveTab("overview");
  };

  const ownShareLabel = formatSharePercentLabel(model.shares.own, {
    includePercentSign: false,
  });
  const valueChainShareLabel = formatSharePercentLabel(
    model.shares.valueChain,
    { includePercentSign: false },
  );

  const overviewBody = (() => {
    if (model.hasOwnData && model.hasValueChainData) {
      return t("companies.understandingEmissions.overview.body", {
        companyName,
        year: yearLabel,
        total: valueByTab.overview,
        ownShare: ownShareLabel ?? "0",
        valueChainShare: valueChainShareLabel ?? "0",
      });
    }
    if (model.hasOwnData) {
      return t("companies.understandingEmissions.overview.bodyOwnOnly", {
        companyName,
        year: yearLabel,
        total: valueByTab.overview,
        ownValue: formatScopeValue(
          model.own,
          currentLanguage,
          notReported,
          unit,
        ),
      });
    }
    return t("companies.understandingEmissions.overview.bodyValueChainOnly", {
      companyName,
      year: yearLabel,
      total: valueByTab.overview,
      valueChainValue: valueByTab.scope3,
    });
  })();

  const scopeBody = (scope: ScopeKey) => {
    if (model[scope] == null) {
      return t(`companies.understandingEmissions.${scope}.bodyNotReported`, {
        companyName,
        year: yearLabel,
      });
    }
    return t(`companies.understandingEmissions.${scope}.body`, {
      companyName,
      value: valueByTab[scope],
      year: yearLabel,
    });
  };

  return (
    <SectionWithHelp
      helpItems={["totalEmissions", "scope1", "scope2", "scope3"]}
    >
      <div className="space-y-6 md:space-y-8">
        <div className="max-w-3xl space-y-3">
          <Text variant="h3">
            {t("companies.understandingEmissions.title")}
          </Text>
          <Text className="text-lg text-grey md:text-xl">
            {t("companies.understandingEmissions.subtitle", {
              companyName,
              year: yearLabel,
            })}
          </Text>
        </div>

        <OwnVsValueChainVisual
          model={model}
          activeTab={activeTab}
          onSelectScope={handleSelectScope}
          onSelectGroup={handleSelectGroup}
        />

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

          <div className="mt-6 space-y-4">
            <TabsContent value="overview" className="mt-0 space-y-4">
              <Text className="text-xl md:text-2xl">
                {t("companies.understandingEmissions.overview.headline")}
              </Text>
              <Text className="text-grey md:text-lg">{overviewBody}</Text>
              <ul className="space-y-3 text-grey md:text-lg">
                <li>
                  {t("companies.understandingEmissions.overview.bulletOwn")}
                </li>
                <li>
                  {t(
                    "companies.understandingEmissions.overview.bulletValueChain",
                  )}
                </li>
                <li>
                  {t("companies.understandingEmissions.overview.bulletScopes")}
                </li>
              </ul>
            </TabsContent>

            <TabsContent value="scope1" className="mt-0 space-y-4">
              <Text className="text-xl md:text-2xl">
                {t("companies.understandingEmissions.scope1.headline")}
              </Text>
              <Text className="text-grey md:text-lg">
                {scopeBody("scope1")}
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
                {scopeBody("scope2")}
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
                {scopeBody("scope3")}
              </Text>

              {model.topScope3Categories.length > 0 ? (
                <div className="space-y-3 rounded-lg bg-black-1 p-4 md:p-5">
                  <Text weight="medium">
                    {t("companies.understandingEmissions.scope3.driversTitle")}
                  </Text>
                  <ul className="space-y-3">
                    {model.topScope3Categories.map((driver) => (
                      <li
                        key={driver.category}
                        className="flex flex-wrap items-baseline justify-between gap-2 border-b border-black-2 pb-2 last:border-0 last:pb-0"
                      >
                        <span>{getCategoryName(driver.category)}</span>
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
                    {t("companies.understandingEmissions.scope3.driversHint")}
                  </Text>
                </div>
              ) : (
                <Text className="text-grey md:text-lg">
                  {t("companies.understandingEmissions.scope3.noCategories")}
                </Text>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </SectionWithHelp>
  );
}
