import React from "react";
import { cn } from "@/lib/utils";

interface ChartWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      {children}
    </div>
  );
};
