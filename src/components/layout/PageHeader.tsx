import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  variant?: "default" | "compact" | "title-only" | "sr-only";
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
  const isTitleOnly = variant === "title-only";
  const isSrOnly = variant === "sr-only";

  if (isSrOnly) {
    return (
      <>
        <h1 className="sr-only">{title}</h1>
        {description && <p className="sr-only">{description}</p>}
      </>
    );
  }

  if (isTitleOnly) {
    return (
      <div className={cn("w-full mb-2 md:mb-3", className)}>
        <h1 className="text-3xl font-light">{title}</h1>
      </div>
    );
  }

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
