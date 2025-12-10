import { ArrowUpRight, FileText } from "lucide-react";
import { Text } from "./text";

interface LinkCardProps {
  link: string | undefined;
  title: string;
  description: string;
  descriptionColor: string;
}

export const LinkCard = ({
  link,
  title,
  description,
  descriptionColor,
}: LinkCardProps) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-black-1 light:bg-grey/10 rounded-level-2 p-6 hover:bg-black-1/80 light:hover:bg-grey/20 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <div>
          <Text
            variant="h6"
            className="flex items-center gap-2 text-white light:text-black-3 mb-2"
          >
            <FileText className="w-6 h-6 text-white light:text-black-3" />
            <span>{title}</span>
          </Text>
          <Text variant="body" className={descriptionColor}>
            {description}
          </Text>
        </div>
        {link && (
          <ArrowUpRight className="w-6 h-6 text-white light:text-black-3" />
        )}
      </div>
    </a>
  );
};
