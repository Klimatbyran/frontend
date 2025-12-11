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
        "flex flex-col min-h-screen items-center justify-center bg-black light:bg-white text-center px-4 py-16",
        className,
      )}
    >
      <div className={cn("w-full", innerClassName)}>{children}</div>
    </section>
  );
}
