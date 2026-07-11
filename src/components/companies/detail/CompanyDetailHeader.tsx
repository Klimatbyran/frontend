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
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Text className="text-4xl lg:text-6xl">{name}</Text>
        {headerChip && <div className="w-fit shrink-0">{headerChip}</div>}
      </div>
      {logoUrl && (
        <CompanyLogo
          src={logoUrl}
          className="hidden size-[120px] shrink-0 rounded-xl object-contain lg:inline"
        />
      )}
    </div>
  );
}
