import { getCountryFlagUrl } from "@/utils/europe/countryFlag";
import { cn } from "@/lib/utils";

type CountryFlagProps = {
  iso2: string;
  countryName: string;
  className?: string;
};

export function CountryFlag({ iso2, countryName, className }: CountryFlagProps) {
  return (
    <img
      src={getCountryFlagUrl(iso2)}
      alt={`${countryName} flag`}
      className={cn(
        "h-[50px] w-auto shrink-0 rounded-md border border-white/10 object-cover shadow-sm md:h-[72px]",
        className,
      )}
      loading="lazy"
    />
  );
}
