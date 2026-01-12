import { ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { DataGuideItemId } from "@/data-guide/items";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";

interface DetailSectionProps {
  title: string;
  items: Array<{
    title: string;
    value: ReactNode;
    valueClassName?: string;
  }>;
  helpItems: DataGuideItemId[];
}

export function DetailSection({ title, items, helpItems }: DetailSectionProps) {
  return (
    <SectionWithHelp helpItems={helpItems}>
      <div className="gap-8 md:gap-16">
        <Text variant={"h3"}>{title}</Text>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 mt-8">
        {items.map((item, index) => (
          <div key={index}>
            <Text className="text-lg md:text-xl">{item.title}</Text>
            <Text className={cn("text-4xl md:text-6xl", item.valueClassName)}>
              {item.value}
            </Text>
          </div>
        ))}
      </div>
    </SectionWithHelp>
  );
}
