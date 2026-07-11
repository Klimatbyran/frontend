import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { formatPercent } from "@/utils/formatting/localization";

interface MeetsParisPieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | null;
    payload?: {
      total?: number | null;
    } | null;
  }>;
}

function MeetsParisPieTooltip({ active, payload }: MeetsParisPieTooltipProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!active || !payload?.length) {
    return null;
  }

  const { name, value, payload: data } = payload[0];
  const safeValue = value ?? 0;
  const total = data?.total ?? 0;
  const percentage =
    total > 0 ? formatPercent(safeValue / total, currentLanguage) : null;

  return (
    <div className="pointer-events-none rounded-lg border border-black-1 bg-black-2 p-4 text-white shadow-xl">
      <p className="mb-1 text-sm font-medium">{name}</p>
      <div className="text-sm text-grey">
        <div>
          {safeValue.toFixed(1)}
          {t("companiesOverviewPage.visualizations.meetsParis.emissionsUnit")}
        </div>
        {percentage && (
          <div>
            {percentage} {t("graphs.pieChart.ofTotal")}
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetsParisPieTooltip;
