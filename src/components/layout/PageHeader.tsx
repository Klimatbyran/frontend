import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  variant?: "default" | "compact";
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  variant = "default",
  children,
  className,
}: PageHeaderProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "max-w-[1200px] mx-auto",
        isCompact ? "mb-2 md:mb-3" : "p-4 mb-4 md:mb-8",
        className,
      )}
    >
      {isCompact ? (
        <div className="flex flex-col md:flex-row md:items-baseline md:gap-3 gap-0.5">
          <h1 className="text-xl md:text-2xl font-medium shrink-0">{title}</h1>
          {description && (
            <>
              <span className="hidden md:inline text-white/20" aria-hidden>
                ·
              </span>
              <p className="text-sm text-white/50 md:truncate">{description}</p>
            </>
          )}
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-light mb-2">{title}</h1>
          {description && <p className="text-sm text-grey">{description}</p>}
        </>
      )}
      {children && (
        <div
          className={cn("flex flex-wrap gap-2", isCompact ? "mt-2" : "mt-0")}
        >
          {children}
        </div>
      )}
    </div>
  );
}
