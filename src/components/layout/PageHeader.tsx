import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  variant?: "default" | "title-only";
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
  if (variant === "title-only") {
    return (
      <div className={cn("w-full mb-2 md:mb-3", className)}>
        <h1 className="text-3xl font-light">{title}</h1>
      </div>
    );
  }

  return (
    <div className={cn("max-w-[1200px] mx-auto p-4 mb-4 md:mb-8", className)}>
      <h1 className="text-3xl font-light mb-2">{title}</h1>
      {description && <p className="text-sm text-grey">{description}</p>}
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
