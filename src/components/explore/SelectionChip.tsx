import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function getSelectionChipClassName(selected: boolean) {
  return cn(
    "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
    selected
      ? "bg-blue-3/20 text-blue-3 shadow-[0_0_12px_rgba(76,155,232,0.3)]"
      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
  );
}

export interface SelectionChipProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: ReactNode;
}

export function SelectionChip({
  selected = false,
  icon,
  className,
  children,
  type = "button",
  ...props
}: SelectionChipProps) {
  return (
    <button
      type={type}
      className={cn(getSelectionChipClassName(selected), className)}
      aria-current={selected ? "true" : undefined}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
