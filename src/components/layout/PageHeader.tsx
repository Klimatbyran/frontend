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
    <div>
      <div className="absolute inset-0 w-screen bg-black left-0 right-0 -z-10 h-full" />
      <div
        className={cn(
          "max-w-[1200px] mx-auto px-4 pt-6 pb-2 space-y-2",
          className,
        )}
      >
        <h1 className="text-3xl font-light">{title}</h1>
        {description && <p className="text-sm text-grey">{description}</p>}
        {children && <div className="flex flex-wrap gap-3">{children}</div>}
      </div>
    </div>
  );
}
