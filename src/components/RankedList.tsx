import { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

export interface RankedListItem {
  name: string;
  value: number;
  link: string;
}

interface RankedListProps {
  title: string;
  description: string;
  items: RankedListItem[];
  className?: string;
  itemValueRenderer: (item: RankedListItem) => React.ReactElement;
  icon: {
    component: React.ComponentType<LucideProps>;
    bgColor: string;
  };
  rankColor: string;
}

export function RankedList({
  title,
  description,
  items,
  className,
  itemValueRenderer,
  icon,
  rankColor,
}: RankedListProps) {
  const Icon = icon.component;

  return (
    <div className={cn("bg-black-2 rounded-level-2 p-4 md:p-8", className)}>
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <Text className="text-2xl md:text-4xl">{title}</Text>
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            icon.bgColor,
          )}
        >
          <Icon className="w-10 h-5 text-black" />
        </div>
      </div>

      <div className="grid gap-y-4 md:gap-y-6 grid-cols-[auto_1fr_auto]">
        <Text className="col-span-full text-md text-grey">{description}</Text>
        {items.map((item, index) => (
          <a
            key={item.link}
            href={item.link}
            className="grid grid-cols-subgrid col-span-full items-center gap-2 md:gap-4 hover:bg-black-1 transition-colors rounded-lg"
          >
            <span className={cn("text-2xl md:text-5xl font-light", rankColor)}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-base md:text-lg">{item.name}</span>
            <div className="flex flex-wrap justify-end">
              {itemValueRenderer(item)}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
