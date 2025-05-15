import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoTooltipProps {
  children: React.ReactNode;
}

export function InfoTooltip({ children }: InfoTooltipProps) {

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info className="w-4 h-4 mb-2" />
        </TooltipTrigger>
        <TooltipContent className="max-w-80">
        {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
