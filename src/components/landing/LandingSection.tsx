import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LandingSectionProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

export function LandingSection({
  children,
  className,
  innerClassName,
}: LandingSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center bg-black text-center px-4 py-8",
        className,
      )}
    >
      <div className={cn("w-full", innerClassName)}>{children}</div>
    </section>
  );
}
