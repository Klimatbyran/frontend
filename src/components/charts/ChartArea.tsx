import React from "react";
import { cn } from "@/lib/utils";

interface ChartAreaProps {
  children: React.ReactNode;
  className?: string;
}

export const ChartArea: React.FC<ChartAreaProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "relative w-full flex-1 min-h-[350px] overflow-visible",
        className,
      )}
    >
      {children}
    </div>
  );
};
