import { InfoTooltip } from "@/components/layout/InfoTooltip";
import { cn } from "@/lib/utils";
import { TrendingDown } from "lucide-react";
import { AiIcon } from "@/components/ui/ai-icon";
import { useTranslation } from "react-i18next";

interface CardInfoProps {
  title: string;
  tooltip?: string;
  value: string | null;
  textColor?: string;
  unit?: string;
  isAIGenerated?: boolean;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function CardInfo({
  title,
  tooltip,
  value,
  textColor = "text-orange-2",
  unit,
  isAIGenerated = false,
  icon = <TrendingDown className="w-4 h-4" />,
  suffix,
}: CardInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-grey light:text-black-1 mb-2 text-lg">
        {icon}
        <span>{title}</span>
        {suffix}
        {tooltip && (
          <InfoTooltip ariaLabel="Additional information">
            <p>{tooltip}</p>
          </InfoTooltip>
        )}
      </div>
      <div className="text-3xl font-light">
        {value ? (
          <span className={cn(textColor)}>
            {value}
            {unit && (
              <span className="text-lg text-grey light:text-black-1 ml-1">
                {unit}
              </span>
            )}
            {isAIGenerated && (
              <span className="ml-2 absolute">
                <AiIcon size="sm" className="absolute top-0" />
              </span>
            )}
          </span>
        ) : (
          <span className="text-grey light:text-black-1">
            {t("companies.card.noData")}
          </span>
        )}
      </div>
    </div>
  );
}
