import { type ReactNode } from "react";
import { CountryFlag } from "@/components/europe/CountryFlag";
import { DetailHeader, DetailStat } from "@/components/detail/DetailHeader";
import { DataGuideItemId } from "@/data-guide/items";

export type EuropeanCountryDetailHeaderProps = {
  name: string;
  iso2: string;
  helpItems: DataGuideItemId[];
  stats: DetailStat[];
  headerChip?: ReactNode;
};

export function EuropeanCountryDetailHeader({
  name,
  iso2,
  helpItems,
  stats,
  headerChip,
}: EuropeanCountryDetailHeaderProps) {
  return (
    <DetailHeader
      name={name}
      headerImage={
        <CountryFlag
          iso2={iso2}
          countryName={name}
          className="h-[50px] shrink-0 md:h-[80px]"
        />
      }
      helpItems={helpItems}
      stats={stats}
      headerChip={headerChip}
    />
  );
}
