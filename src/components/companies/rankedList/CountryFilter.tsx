import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useCompanyCountryNames } from "@/hooks/companies/companyCountryFilterUtils";
import { useCountryTagOptions } from "@/hooks/companies/useCountryTagOptions";
import { useScreenSize } from "@/hooks/useScreenSize";
import { Checkbox } from "@/components/ui/checkbox";

interface CountryFilterProps {
  availableCountries: string[];
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
}

export function CountryFilter({
  availableCountries,
  selectedCountries,
  onCountriesChange,
}: CountryFilterProps) {
  const { t } = useTranslation();
  const { data: countryOptions = [] } = useCountryTagOptions();
  const countryNames = useCompanyCountryNames(countryOptions);
  const { isMobile } = useScreenSize();

  const handleCountryToggle = (country: string) => {
    if (selectedCountries.includes(country)) {
      onCountriesChange(selectedCountries.filter((value) => value !== country));
      return;
    }

    onCountriesChange([...selectedCountries, country]);
  };

  if (availableCountries.length === 0) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="space-y-2">
        <label className="text-sm text-grey">
          {t("companiesOverviewPage.selectCountry", "Select country")}:
        </label>
        <div className="space-y-2 rounded-level-1 border border-black-3 bg-black-2 p-3">
          {availableCountries.map((country) => {
            const isSelected = selectedCountries.includes(country);

            return (
              <label
                key={country}
                className="flex items-center gap-2 text-sm text-white"
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleCountryToggle(country)}
                />
                {countryNames[country] ?? country}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-grey mr-1">
        {t("companiesOverviewPage.selectCountry", "Select country")}:
      </span>
      {availableCountries.map((country) => {
        const isSelected = selectedCountries.includes(country);

        return (
          <button
            key={country}
            type="button"
            onClick={() => handleCountryToggle(country)}
            className={cn(
              "px-3 py-1.5 rounded-level-1 text-xs font-medium transition-all",
              "border",
              isSelected
                ? "bg-blue-5/30 border-blue-4 text-blue-2 hover:bg-blue-5/40"
                : "bg-black-2 border-black-3 text-grey hover:bg-black-3 hover:border-black-4",
            )}
          >
            {countryNames[country] ?? country}
          </button>
        );
      })}
    </div>
  );
}
