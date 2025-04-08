import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Text } from "@/components/ui/text";

interface BlockHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function BlockHeader({
  title,
  description,
  icon,
  action,
  className,
}: BlockHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-12", className)}>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Text variant="h3">{title}</Text>
          {action}
        </div>
        {description && (
          <Text variant="muted" className="text-lg max-w-3xl">
            {description}
          </Text>
        )}
      </div>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-blue-5/30 flex items-center justify-center">
          {icon}
        </div>
      )}
    </div>
  );
}
