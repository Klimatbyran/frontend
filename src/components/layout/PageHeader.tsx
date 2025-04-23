import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <>
      <div className={cn("max-w-[1200px] mx-auto p-4 mb-4 md:mb-8", className)}>
        <h1 className="text-3xl font-light mb-2">{title}</h1>
        {description && <p className="text-sm text-grey">{description}</p>}
        {children && <div className="flex flex-wrap gap-2">{children}</div>}
      </div>
    </>
  );
}
