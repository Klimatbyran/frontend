import { TrendingDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import { cn } from "@/lib/utils";
import { AiIcon } from "@/components/ui/ai-icon";

interface CardInfoProps {
  title: string;
  tooltip?: string;
  value: string | undefined | null;
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
    <div>
      <div className="flex items-center gap-2 text-grey mt-2 text-lg">
        {icon}
        <span>{title}</span>
        {suffix}
        {tooltip && (
          <InfoTooltip ariaLabel="Additional information">
            <p>{tooltip}</p>
          </InfoTooltip>
        )}
      </div>
      <div className="text-xl font-light">
        {value ? (
          <span className={cn(textColor)}>
            {value}
            {unit && <span className="text-lg text-grey ml-1">{unit}</span>}
            {isAIGenerated && (
              <span className="ml-2 absolute">
                <AiIcon size="sm" className="absolute top-0" />
              </span>
            )}
          </span>
        ) : (
          <span className="text-grey">{t("companies.card.noData")}</span>
        )}
      </div>
    </div>
  );
}
