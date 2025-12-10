import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { isMobile } from "react-device-detect";
import { useMobileModal } from "../../hooks/useMobileModal";
import { MobileModal } from "./MobileModal";

interface InfoTooltipProps {
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
  ariaLabel?: string;
}

export function InfoTooltip({
  children,
  className = "w-4 h-4 text-grey",
  side = "top",
  ariaLabel = "Show more information",
}: InfoTooltipProps) {
  const {
    isOpen,
    modalRef,
    handleClose,
    handleMobileClick,
    handleMobileKeyDown,
  } = useMobileModal();

  // For mobile, use a full-screen modal popup
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto hover:bg-transparent focus:outline-none focus:ring-0"
          onClick={handleMobileClick}
          onKeyDown={handleMobileKeyDown}
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <Info className={className} />
        </Button>

        <MobileModal
          isOpen={isOpen}
          modalRef={modalRef}
          onClose={handleClose}
          titleId="tooltip-title"
        >
          {children}
        </MobileModal>
      </>
    );
  }

  // For desktop, use the normal tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent focus:outline-none focus:ring-0"
            aria-label={ariaLabel}
          >
            <Info className={className} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-80">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
