import { ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface DetailMetadataPanelProps {
  children: ReactNode;
  className?: string;
}

export function DetailMetadataPanel({
  children,
  className,
}: DetailMetadataPanelProps) {
  return (
    <div className={cn("@container mt-3 md:mt-0", className)}>
      <div className="mt-8 @md:mt-12 bg-black-1 rounded-level-2 p-6">
        <div className="grid grid-cols-1 @md:grid-cols-3 gap-4 @md:gap-8">
          {children}
        </div>
      </div>
    </div>
  );
}

interface DetailMetadataFieldProps {
  label: ReactNode;
  children: ReactNode;
}

export function DetailMetadataField({ label, children }: DetailMetadataFieldProps) {
  return (
    <div>
      <Text className="md:mb-2 font-bold">{label}</Text>
      {children}
    </div>
  );
}
