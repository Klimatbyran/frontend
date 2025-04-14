import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

interface ContentBlockProps {
  title: string;
  content: string;
  className?: string;
}

export function ContentBlock({ title, content, className }: ContentBlockProps) {
  return (
    <div
      className={cn(
        "bg-black-2 rounded-[24px] p-8 md:rounded-[48px] md:p-16",
        className,
      )}
    >
      <div className="space-y-4 md:space-y-8">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#E2FF8D]" />
          <Text className="text-grey text-md md:text-2xl">{title}</Text>
        </div>

        <Text className="max-w-full md:max-w-[90%] text-md md:text-2xl leading-[1.2] md:leading-[1.1] tracking-[-0.02em] break-words">
          {content}
        </Text>
      </div>
    </div>
  );
}
