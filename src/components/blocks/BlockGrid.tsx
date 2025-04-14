import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BlockGridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: "small" | "medium" | "large";
}

const columnMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

const gapMap = {
  small: "gap-4",
  medium: "gap-6",
  large: "gap-8",
};

export function BlockGrid({
  children,
  className,
  columns = 2,
  gap = "medium",
}: BlockGridProps) {
  return (
    <div className={cn("grid", columnMap[columns], gapMap[gap], className)}>
      {children}
    </div>
  );
}
