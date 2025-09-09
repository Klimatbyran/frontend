import { Info, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { isMobile } from "react-device-detect";

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
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Focus management for modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const closeButton = modalRef.current.querySelector("button");
      closeButton?.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling to parent link
    setIsOpen(true);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(true);
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(false);
  };

  // For mobile, use a full-screen modal popup
  if (isMobile) {
    return (
      <>
        <Button
          ref={buttonRef}
          variant="ghost"
          size="sm"
          className="p-0 h-auto hover:bg-transparent focus:outline-none focus:ring-0"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <Info className={className} />
        </Button>
  
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tooltip-title"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={handleClose}
              aria-hidden="true"
            />
  
            <div
              ref={modalRef}
              className="relative bg-black-2 border border-black-1 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 p-1 h-auto text-grey hover:text-white focus:outline-none focus:ring-0"
                onClick={handleClose}
                aria-label="Close information"
              >
                <X className="w-5 h-5" />
              </Button>
  
              {/* Content */}
              <div id="tooltip-title" className="text-sm text-white pr-8">
                {children}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // For desktop, use the normal tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={buttonRef}
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
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
