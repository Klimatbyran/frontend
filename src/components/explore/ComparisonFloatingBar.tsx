import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComparisonAddButton } from "./ComparisonAddButton";
import { DetailComparisonButton } from "./DetailComparisonButton";
import { useComparison } from "@/contexts/ComparisonContext";
import { useComparisonDetailEntity } from "@/contexts/ComparisonDetailEntityContext";
import { useLanguage } from "@/components/LanguageProvider";
import { localizedPath } from "@/utils/routing";
import {
  COMPARISON_MAX,
  COMPARISON_MIN,
} from "@/utils/explore/comparisonUtils";

export function ComparisonFloatingBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const { selectedCount, canViewComparison, clearSelection, variant } =
    useComparison();
  const detailEntity = useComparisonDetailEntity();
  const addEntityVariant = detailEntity?.variant ?? variant;

  if (
    location.pathname.includes("/explore/compare") ||
    (!detailEntity && selectedCount === 0)
  ) {
    return null;
  }

  const hasSelection = selectedCount > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black-1 bg-black/95 backdrop-blur-sm">
      <div
        className={cn(
          "mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 md:px-6",
          hasSelection ? "justify-between" : "justify-end",
        )}
      >
        {hasSelection && (
          <div className="flex items-center gap-2 text-sm">
            <GitCompareArrows className="h-4 w-4 text-blue-2" />
            <span className="text-grey">
              {t("explorePage.comparison.selected", {
                count: selectedCount,
                min: COMPARISON_MIN,
                max: COMPARISON_MAX,
              })}
            </span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {!hasSelection && detailEntity && (
            <DetailComparisonButton
              linkTo={detailEntity.linkTo}
              variant={detailEntity.variant}
            />
          )}
          {hasSelection && (
            <>
              <ComparisonAddButton entityVariant={addEntityVariant} />
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                {t("explorePage.comparison.clearSelection")}
              </Button>
              <Button
                size="default"
                disabled={!canViewComparison}
                onClick={() =>
                  navigate(localizedPath(currentLanguage, "/explore/compare"))
                }
                className={cn(
                  "gap-2 font-medium",
                  canViewComparison &&
                    "bg-blue-5 text-white hover:bg-blue-6 hover:opacity-100",
                )}
              >
                <GitCompareArrows className="h-4 w-4" />
                {t("explorePage.comparison.viewComparison")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
