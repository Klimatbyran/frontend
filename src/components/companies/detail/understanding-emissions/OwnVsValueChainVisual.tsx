import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import type {
  EmissionsGroupKey,
  GuideTab,
  ScopeKey,
  UnderstandingEmissionsModel,
} from "./buildUnderstandingEmissionsModel";
import { SCOPE_COLORS } from "./buildUnderstandingEmissionsModel";

type OwnVsValueChainVisualProps = {
  model: UnderstandingEmissionsModel;
  activeTab: GuideTab;
  onSelectScope: (scope: ScopeKey) => void;
  onSelectGroup: (group: EmissionsGroupKey) => void;
  className?: string;
};

const MIN_SHARE = 0.08;

function displayShare(share: number | null, fallback = 0): number {
  if (share == null || share <= 0) return fallback;
  return Math.max(share, MIN_SHARE);
}

function isScopeActive(activeTab: GuideTab, scope: ScopeKey): boolean {
  return activeTab === "overview" || activeTab === scope;
}

function isGroupActive(activeTab: GuideTab, group: EmissionsGroupKey): boolean {
  if (activeTab === "overview") return true;
  if (group === "own") return activeTab === "scope1" || activeTab === "scope2";
  return activeTab === "scope3";
}

export function OwnVsValueChainVisual({
  model,
  activeTab,
  onSelectScope,
  onSelectGroup,
  className,
}: OwnVsValueChainVisualProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const unit = t("emissionsUnit");

  const ownShare = model.shares.own;
  const valueChainShare = model.shares.valueChain;
  const hasOwn = ownShare != null && ownShare > 0;
  const hasValueChain = valueChainShare != null && valueChainShare > 0;

  if (!hasOwn && !hasValueChain) {
    return null;
  }

  const ownWidth = hasOwn
    ? displayShare(ownShare, hasValueChain ? MIN_SHARE : 1)
    : 0;
  const valueChainWidth = hasValueChain
    ? displayShare(valueChainShare, hasOwn ? MIN_SHARE : 1)
    : 0;
  const widthSum = ownWidth + valueChainWidth;

  const formatValue = (value: number | null) => {
    if (value == null) return t("companies.understandingEmissions.notReported");
    return `${formatEmissionsAbsolute(value, currentLanguage)} ${unit}`;
  };

  const formatPct = (share: number | null) => {
    if (share == null) return null;
    const pct = share * 100;
    if (pct > 0 && pct < 1) return "<1%";
    if (pct > 99 && pct < 100) return ">99%";
    return `${Math.round(pct)}%`;
  };

  const scope1Internal = model.ownInternalShares.scope1;
  const scope2Internal = model.ownInternalShares.scope2;
  const showOwnSplit =
    (scope1Internal != null && scope1Internal > 0) ||
    (scope2Internal != null && scope2Internal > 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className="flex min-h-[148px] overflow-hidden rounded-level-2 bg-black-1 md:min-h-[168px]"
        role="img"
        aria-label={t("companies.understandingEmissions.breakdownAria")}
      >
        {hasOwn && (
          <div
            className={cn(
              "relative flex flex-col justify-between gap-3 border-r border-black-2 p-4 transition-opacity duration-200 md:p-5",
              isGroupActive(activeTab, "own") ? "opacity-100" : "opacity-35",
            )}
            style={{ flexGrow: ownWidth / widthSum, flexBasis: 0 }}
          >
            <button
              type="button"
              onClick={() => onSelectGroup("own")}
              className="space-y-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <p className="text-xs uppercase tracking-wide text-grey">
                {t("companies.understandingEmissions.groups.own")}
              </p>
              <p className="text-2xl font-medium text-white md:text-3xl">
                {formatPct(ownShare)}
              </p>
              <p className="text-sm text-grey">{formatValue(model.own)}</p>
            </button>

            {showOwnSplit && (
              <div className="flex h-10 overflow-hidden rounded-md bg-black-2/60">
                {scope1Internal != null && scope1Internal > 0 && (
                  <button
                    type="button"
                    title={t("companies.understandingEmissions.tabs.scope1")}
                    onClick={() => onSelectScope("scope1")}
                    className={cn(
                      "flex items-center justify-center px-2 text-xs font-medium text-black transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                      isScopeActive(activeTab, "scope1")
                        ? "opacity-100"
                        : "opacity-45",
                    )}
                    style={{
                      width: `${Math.max(scope1Internal * 100, 12)}%`,
                      backgroundColor: SCOPE_COLORS.scope1,
                    }}
                  >
                    <span className="truncate">
                      {t("companies.understandingEmissions.short.scope1")}
                    </span>
                  </button>
                )}
                {scope2Internal != null && scope2Internal > 0 && (
                  <button
                    type="button"
                    title={t("companies.understandingEmissions.tabs.scope2")}
                    onClick={() => onSelectScope("scope2")}
                    className={cn(
                      "flex items-center justify-center px-2 text-xs font-medium text-black transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                      isScopeActive(activeTab, "scope2")
                        ? "opacity-100"
                        : "opacity-45",
                    )}
                    style={{
                      width: `${Math.max(scope2Internal * 100, 12)}%`,
                      backgroundColor: SCOPE_COLORS.scope2,
                    }}
                  >
                    <span className="truncate">
                      {t("companies.understandingEmissions.short.scope2")}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {hasValueChain && (
          <button
            type="button"
            onClick={() => onSelectGroup("valueChain")}
            className={cn(
              "relative flex flex-col justify-between gap-3 p-4 text-left transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white md:p-5",
              isGroupActive(activeTab, "valueChain")
                ? "opacity-100"
                : "opacity-35",
            )}
            style={{ flexGrow: valueChainWidth / widthSum, flexBasis: 0 }}
          >
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-grey">
                {t("companies.understandingEmissions.groups.valueChain")}
              </p>
              <p className="text-2xl font-medium text-white md:text-3xl">
                {formatPct(valueChainShare)}
              </p>
              <p className="text-sm text-grey">
                {formatValue(model.valueChain)}
              </p>
            </div>

            <div
              className={cn(
                "flex h-10 items-center justify-center rounded-md px-3 text-xs font-medium text-black transition-opacity",
                isScopeActive(activeTab, "scope3")
                  ? "opacity-100"
                  : "opacity-45",
              )}
              style={{ backgroundColor: SCOPE_COLORS.scope3 }}
            >
              {t("companies.understandingEmissions.short.scope3")}
            </div>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-grey">
        {(["scope1", "scope2", "scope3"] as ScopeKey[]).map((scope) => {
          const share = model.shares[scope];
          if (share == null) return null;
          return (
            <button
              key={scope}
              type="button"
              onClick={() => onSelectScope(scope)}
              className={cn(
                "inline-flex items-center gap-2 transition-colors",
                isScopeActive(activeTab, scope)
                  ? "text-white"
                  : "text-grey hover:text-white",
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SCOPE_COLORS[scope] }}
                aria-hidden
              />
              <span>
                {t(`companies.understandingEmissions.tabs.${scope}`)}
                {" · "}
                {share > 0 && share * 100 < 1
                  ? "<1%"
                  : share * 100 > 99 && share * 100 < 100
                    ? ">99%"
                    : `${Math.round(share * 100)}%`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
