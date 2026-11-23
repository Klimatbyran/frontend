import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ChartTooltipHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("w-full text-sm text-white font-medium mb-2", className)}
    >
      {children}
    </div>
  );
}
