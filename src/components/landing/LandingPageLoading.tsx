import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LandingPageLoading() {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col items-center h-screen bg-black-3"
      aria-busy="true"
      aria-live="polite"
      aria-label={t("common.loading")}
    >
      <div className="flex-1 flex flex-col items-center text-center px-4 pt-32 md:pt-48 w-full max-w-4xl mx-auto space-y-8">
        <div className="w-full max-w-lg md:max-w-4xl mx-auto space-y-4">
          <div className="h-12 md:h-16 w-3/4 mx-auto animate-pulse bg-black-2 rounded" />
          <div className="h-20 md:h-28 w-1/2 mx-auto animate-pulse bg-black-2 rounded" />
        </div>
        <div className="w-full max-w-xl space-y-4">
          <div className="h-4 w-full animate-pulse bg-black-2 rounded" />
          <div className="h-12 w-full animate-pulse bg-black-2 rounded-level-2" />
        </div>
        <div className="flex items-center gap-2 text-grey">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{t("common.loading")}</span>
        </div>
      </div>
      <div className="w-full h-48 md:h-64 animate-pulse bg-black-2" />
    </div>
  );
}
