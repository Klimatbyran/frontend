import React from "react";
import { cn } from "@/lib/utils";

interface ChartFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ChartFooter: React.FC<ChartFooterProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={cn("mt-2 mb-2 space-y-4 min-h-0", className)}>
      {children}
    </div>
  );
};
