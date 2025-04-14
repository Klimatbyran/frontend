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
      className="block bg-black-1 rounded-level-2 p-6 hover:bg-blue-5/30 transition-colors text-white hover:text-blue-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex items-center justify-between mb-2">
        <Text className="font-bold underline">{title}</Text>
        <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
      </div>
      <Text className="text-sm sm:text-base md:text-lg">{text}</Text>
    </a>
  );
}
