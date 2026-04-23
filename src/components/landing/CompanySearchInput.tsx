import { useState, useEffect, useLayoutEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import { useCompanySearch } from "@/hooks/companies/useCompanySearch";
import { RankedCompany } from "@/types/company";

export const CompanySearchInput = memo(function CompanySearchInput({
  onSelect,
  onBusyChange,
}: {
  onSelect: (company: RankedCompany) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("Arla");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { searchResults, isSearching, isDebouncing } =
    useCompanySearch(searchQuery);

  useEffect(() => {
    onBusyChange?.(isDebouncing || isSearching);
  }, [isDebouncing, isSearching, onBusyChange]);

  // On mount, set input and searchQuery to Arla
  useEffect(() => {
    setInputValue("Arla");
    setSearchQuery("Arla");
  }, []);

  // Auto-select Arla on mount before paint to avoid chart placeholder flash
  useLayoutEffect(() => {
    if (searchQuery.trim() === "Arla" && searchResults.length > 0) {
      onSelect(searchResults[0] as RankedCompany);
    }
  }, [searchResults, searchQuery, onSelect]);

  return (
    <div className="relative w-full max-w-[18rem]">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
          aria-hidden="true"
        />
        <Input
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            setSearchQuery(event.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsDropdownOpen(false);
          }}
          placeholder={t("landingPage.searchPlaceholder")}
          className="h-11 border-white/25 bg-black-2 pl-10 text-white placeholder:text-white/50 focus-visible:ring-white/40"
          aria-label={t("landingPage.placeholder")}
        />
      </div>
      {isDropdownOpen && inputValue.trim() && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-48 w-full overflow-y-auto rounded-md border border-white/10 bg-black-2 shadow-lg">
          {isDebouncing || isSearching ? (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-white/70">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>{t("landingPage.heroSearchLoadingText")}</span>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.slice(0, 30).map((company) => (
              <button
                key={company.wikidataId}
                type="button"
                tabIndex={0}
                onClick={() => {
                  onSelect(company as RankedCompany);
                  setInputValue(company.name);
                  setIsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              >
                {company.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-white/60">
              {t("globalSearch.searchDialog.emptyText")}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
