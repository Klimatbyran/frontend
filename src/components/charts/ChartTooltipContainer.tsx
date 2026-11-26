import type { ReactNode } from "react";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";

export function ChartTooltipContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isMobile } = useScreenSize();

  return (
    <div
      className={cn(
        isMobile ? "max-w-[280px]" : "max-w-[400px]",
        "bg-black-1 px-4 py-3 rounded-level-2",
        "z-[60] relative text-xs text-grey",
        className,
      )}
    >
      {children}
    </div>
  );
}
