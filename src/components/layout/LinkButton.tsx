import { ArrowUpRight } from "lucide-react";
import { Text } from "@/components/ui/text";

interface LinkButtonProps {
  title: string;
  text: string;
  link: string;
}

export function LinkButton({ title, text, link }: LinkButtonProps) {
  return (
    <a
      href={link}
      className="block dark:bg-black-1 bg-grey/10 rounded-level-2 p-6 dark:hover:bg-blue-5/30 hover:bg-blue-1/50 transition-colors dark:text-white text-black-3 dark:hover:text-blue-2 hover:text-blue-3"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex items-center justify-between mb-2">
        <Text className="font-bold underline dark:text-white text-black-3">
          {title}
        </Text>
        <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 dark:text-white text-black-3" />
      </div>
      <Text className="text-sm sm:text-base md:text-lg dark:text-white text-black-3">
        {text}
      </Text>
    </a>
  );
}
