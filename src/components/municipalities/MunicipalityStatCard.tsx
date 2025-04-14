import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number | undefined;
  unit?: string;
  valueClassName?: string;
}

export function MunicipalityStatCard({
  title,
  value,
  unit,
  valueClassName,
}: StatCardProps) {
  return (
    <div>
      <Text className="text-lg md:text-xl">{title}</Text>
      <div className="flex items-baseline space-x-2">
        <Text className={cn("text-4xl md:text-6xl", valueClassName)}>
          {value}
        </Text>
        <Text className="text-md md:text-2xl text-grey">{unit}</Text>
      </div>
    </div>
  );
}
