import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
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
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const sizeClasses = {
    sm: "w-4 h-3 rounded",
    md: "w-5 h-4 rounded-md",
    lg: "w-6 h-5 rounded-md",
  };

  const iconElement = (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden border-2 border-grey",
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

  const url = `/${currentLang}/methodology?view=company`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Make it keyboard accessible like a link
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      navigate(url);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="link"
            className="inline-block cursor-pointer border-none bg-transparent p-0 hover:opacity-80 transition-opacity"
            aria-label={t("companies.overview.aiGeneratedData")}
          >
            {iconElement}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span>{t("companies.overview.aiGeneratedData")}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
