import { ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface SupplementalDataPanelProps {
  children: ReactNode;
  className?: string;
}

export function SupplementalDataPanel({
  children,
  className,
}: SupplementalDataPanelProps) {
  return (
    <div className={cn("@container mt-3 md:mt-0", className)}>
      <div className="mt-8 @md:mt-12 bg-black-1 rounded-level-2 p-6">
        <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-flow-col @lg:grid-cols-none @lg:auto-cols-fr gap-4 @md:gap-8">
          {children}
        </div>
      </div>
    </div>
  );
}

interface SupplementalDataFieldProps {
  label: ReactNode;
  children: ReactNode;
}

export function SupplementalDataField({
  label,
  children,
}: SupplementalDataFieldProps) {
  return (
    <div>
      <Text className="md:mb-2 font-bold">{label}</Text>
      {children}
    </div>
  );
}
