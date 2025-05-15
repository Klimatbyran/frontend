import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AiIconProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTooltip?: boolean;
}

export const AiIcon = ({
  size = "md",
  className,
  showTooltip = true,
}: AiIconProps) => {
  const { t } = useTranslation();
  const sizeClasses = {
    sm: "w-4 h-3 rounded",
    md: "w-5 h-4 rounded-md",
    lg: "w-6 h-5 rounded-md",
  };

  const iconElement = (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden border-2 border-green-3",
        sizeClasses[size],
        className,
      )}
    >
      <img src="/icons/ai-inverse.svg" alt="AI Icon" className="object-cover" />
    </div>
  );

  if (!showTooltip) {
    return iconElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/methodology" className="inline-block">
            {iconElement}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("companies.overview.aiGeneratedData")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
