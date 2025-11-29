import { Text } from "@/components/ui/text";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkCardProps {
  title: string;
  description: string;
  link?: string;
  descriptionClassName?: string;
}

export function LinkCard({
  title,
  description,
  link,
  descriptionClassName,
}: LinkCardProps) {
  return (
    <a
      href={link || undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-black-2 rounded-level-3 p-4 md:p-8 hover:bg-black-1 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Text className="text-2xl md:text-4xl">{title}</Text>
          <Text className={cn("text-lg md:text-xl", descriptionClassName)}>
            {description}
          </Text>
        </div>
        {link && (
          <ArrowUpRight className="w-6 h-6 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        )}
      </div>
    </a>
  );
}
