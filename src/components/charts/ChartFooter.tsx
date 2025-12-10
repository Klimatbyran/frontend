import React from "react";
import { cn } from "@/lib/utils";
import { useScreenSize } from "@/hooks/useScreenSize";

interface ChartFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ChartFooter: React.FC<ChartFooterProps> = ({
  children,
  className = "",
}) => {
  const { isMobile } = useScreenSize();

  return (
    <div
      className={cn(
        "mt-2 mb-2 min-h-0",
        isMobile ? "space-y-3 px-2" : "space-y-4",
        className,
      )}
    >
      {children}
    </div>
  );
};
