import { type ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { CompanyLogo } from "../CompanyLogo";

interface CompanyDetailHeaderProps {
  name: string;
  logoUrl?: string | null;
  headerChip?: ReactNode;
}

export function CompanyDetailHeader({
  name,
  logoUrl,
  headerChip,
}: CompanyDetailHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4 md:mb-12">
      <Text className="text-4xl lg:text-6xl">{name}</Text>
      {(headerChip || logoUrl) && (
        <div className="flex shrink-0 flex-col items-end gap-3">
          {headerChip}
          {logoUrl && (
            <CompanyLogo
              src={logoUrl}
              className="hidden size-[120px] rounded-xl object-contain lg:inline"
            />
          )}
        </div>
      )}
    </div>
  );
}
