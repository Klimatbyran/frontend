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
        isCompact
          ? "w-full mb-3 md:mb-4"
          : "max-w-[1200px] mx-auto p-4 mb-4 md:mb-8",
        className,
      )}
    >
      {isCompact ? (
        <>
          <h1 className="text-2xl font-light leading-tight">{title}</h1>
          {description && (
            <p className="text-sm text-grey mt-1">{description}</p>
          )}
        </>
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
