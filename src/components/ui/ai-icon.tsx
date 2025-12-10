import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { isMobile } from "react-device-detect";
import { useMobileModal } from "@/hooks/useMobileModal";
import { MobileModal } from "@/components/layout/MobileModal";

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
  const {
    isOpen,
    modalRef,
    handleClose,
    handleMobileClick,
    handleMobileKeyDown,
  } = useMobileModal();

  const sizeClasses = {
    sm: "w-4 h-3 rounded",
    md: "w-5 h-4 rounded-md",
    lg: "w-6 h-5 rounded-md",
  };

  const tooltipText = t("companies.overview.aiGeneratedData");

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

  // For mobile, use a full-screen modal popup
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto hover:bg-transparent focus:outline-none focus:ring-0 inline-block"
          onClick={handleMobileClick}
          onKeyDown={handleMobileKeyDown}
          aria-label={tooltipText}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          {iconElement}
        </Button>

        <MobileModal
          isOpen={isOpen}
          modalRef={modalRef}
          onClose={handleClose}
          titleId="ai-tooltip-title"
        >
          {tooltipText}
        </MobileModal>
      </>
    );
  }

  // For desktop, use the normal tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block" aria-label={tooltipText}>
            {iconElement}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <span>{tooltipText}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
