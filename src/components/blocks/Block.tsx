import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BlockProps {
  children: ReactNode;
  className?: string;
  level?: 1 | 2;
  padding?: "none" | "small" | "medium" | "large";
}

const paddingMap = {
  none: "p-0",
  small: "p-6",
  medium: "p-8",
  large: "p-16",
};

export function Block({
  children,
  className,
  level = 2,
  padding = "medium",
}: BlockProps) {
  return (
    <div
      className={cn(
        "bg-black-2",
        level === 1 ? "rounded-level-1" : "rounded-level-2",
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
