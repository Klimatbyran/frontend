import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { GuideTab, ScopeKey } from "./buildUnderstandingEmissionsModel";
import { SCOPE_COLORS } from "./buildUnderstandingEmissionsModel";

type ScopeBreakdownBarProps = {
  shares: Record<ScopeKey, number | null>;
  activeTab: GuideTab;
  onSelectScope: (scope: ScopeKey) => void;
  className?: string;
};

const SCOPES: ScopeKey[] = ["scope1", "scope2", "scope3"];

export function ScopeBreakdownBar({
  shares,
  activeTab,
  onSelectScope,
  className,
}: ScopeBreakdownBarProps) {
  const { t } = useTranslation();
  const segments = SCOPES.filter((scope) => (shares[scope] ?? 0) > 0);

  if (segments.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="flex h-4 overflow-hidden rounded-full bg-black-1"
        role="img"
        aria-label={t("companies.understandingEmissions.breakdownAria")}
      >
        {segments.map((scope) => {
          const share = shares[scope] ?? 0;
          const isActive = activeTab === "overview" || activeTab === scope;
          return (
            <button
              key={scope}
              type="button"
              title={t(`companies.understandingEmissions.tabs.${scope}`)}
              onClick={() => onSelectScope(scope)}
              className={cn(
                "h-full transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                isActive ? "opacity-100" : "opacity-40",
              )}
              style={{
                width: `${Math.max(share * 100, 2)}%`,
                backgroundColor: SCOPE_COLORS[scope],
              }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-grey">
        {SCOPES.map((scope) => {
          const share = shares[scope];
          if (share == null) return null;
          return (
            <button
              key={scope}
              type="button"
              onClick={() => onSelectScope(scope)}
              className={cn(
                "inline-flex items-center gap-2 transition-colors",
                activeTab === scope || activeTab === "overview"
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
                {Math.round(share * 100)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
