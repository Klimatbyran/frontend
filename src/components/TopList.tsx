import { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { LocalizedLink } from "./LocalizedLink";

export interface TopListItem {
  name: string;
  value: number;
  link: string;
}

interface TopListProps {
  title: string;
  description: string;
  items: TopListItem[];
  className?: string;
  itemValueRenderer: (item: TopListItem) => React.ReactElement;
  icon: {
    component: React.ComponentType<LucideProps>;
    bgColor: string;
  };
  rankColor: string;
  headingLink?: string;
}

export function TopList({
  title,
  description,
  items,
  className,
  itemValueRenderer,
  icon,
  rankColor,
  headingLink,
}: TopListProps) {
  const Icon = icon.component;

  return (
    <div
      className={cn(
        "bg-black-2 light:bg-grey/10 rounded-level-2 p-4 md:p-8 border border-transparent light:border-grey/20",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <Text className="text-2xl md:text-4xl">
          <a href={headingLink}>{title}</a>
        </Text>
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            icon.bgColor,
          )}
        >
          <Icon className="w-10 h-5 text-black" />
        </div>
      </div>

      <div className="grid gap-y-6 grid-cols-[auto_1fr_auto]">
        <Text className="col-span-full text-md text-grey">{description}</Text>
        {items.map((item, index) => (
          <LocalizedLink
            key={item.link}
            to={item.link}
            className="grid grid-cols-subgrid col-span-full items-center gap-4 hover:bg-black-1 light:hover:bg-grey/10 transition-colors rounded-lg"
          >
            <span className={cn("text-2xl sm:text-5xl font-light", rankColor)}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-base md:text-lg">{item.name}</span>
            <div className="flex items-center md:justify-end">
              {itemValueRenderer(item)}
            </div>
          </LocalizedLink>
        ))}
      </div>
    </div>
  );
}
