import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/contexts/ComparisonContext";
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
  const { selectedCount, canViewComparison, clearSelection } = useComparison();

  const isExploreListPage = /\/explore\/(municipalities|regions|companies)\/?$/.test(
    location.pathname,
  );

  if (
    selectedCount === 0 ||
    location.pathname.includes("/explore/compare") ||
    isExploreListPage
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black-1 bg-black/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
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
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            {t("explorePage.comparison.clearSelection")}
          </Button>
          <Button
            size="sm"
            disabled={!canViewComparison}
            onClick={() =>
              navigate(localizedPath(currentLanguage, "/explore/compare"))
            }
          >
            {t("explorePage.comparison.viewComparison")}
          </Button>
        </div>
      </div>
    </div>
  );
}
