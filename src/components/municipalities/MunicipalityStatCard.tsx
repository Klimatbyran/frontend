import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "../layout/InfoTooltip";

interface StatCardProps {
  title: string;
  value: string | number | undefined;
  unit?: string;
  valueClassName?: string;
  info?: boolean,
  infoText?: string
}

export function MunicipalityStatCard({
  title,
  value,
  unit,
  valueClassName,
  info,
  infoText,
}: StatCardProps) {
  return (
    <div>
      <div className="flex gap-2">
        <Text className="text-lg md:text-xl">{title}</Text>
      {info && (
        <span className="text-grey">
          <InfoTooltip>
            <p>{infoText}</p>
          </InfoTooltip>
        </span>
        )}
      </div>
      <div className="flex items-baseline space-x-2">
        <Text className={cn("text-4xl md:text-6xl", valueClassName)}>
          {value}
        </Text>
        <Text className="text-md md:text-2xl text-grey">{unit}</Text>
      </div>
    </div>
  );
}
