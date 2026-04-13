import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { LandingSection } from "./LandingSection";
import { useLanguage } from "@/components/LanguageProvider";
import { getEntityDetailPath, localizedPath } from "@/utils/routing";
import type { RankedCompany } from "@/types/company";
import type { Municipality } from "@/types/municipality";
import { Text } from "../ui/text";

type HeroSearchResult =
  | { type: "company"; id: string; name: string }
  | { type: "municipality"; name: string };

interface LandingPageCTAProps {
  companies: RankedCompany[];
  municipalities: Municipality[];
}

const POPULAR_ITEMS = [
  { label: "H&M", type: "company" as const },
  { label: "ABB", type: "company" as const },
  { label: "Stockholm", type: "municipality" as const },
  { label: "Malmö", type: "municipality" as const },
];

export function LandingPageCTA({
  companies,
  municipalities,
}: LandingPageCTAProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const target = searchContainerRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          setIsDropdownOpen(false);
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return [] as HeroSearchResult[];
    }

    const companyResults: HeroSearchResult[] = companies
      .filter((company) => company.name.toLowerCase().includes(query))
      .map((company) => ({
        type: "company",
        id: String(company.wikidataId),
        name: company.name,
      }));

    const municipalityResults: HeroSearchResult[] = municipalities
      .filter((municipality) => municipality.name.toLowerCase().includes(query))
      .map((municipality) => ({
        type: "municipality",
        name: municipality.name,
      }));

    return [...companyResults, ...municipalityResults].slice(0, 8);
  }, [companies, municipalities, searchQuery]);

  const handleSearchSelection = useCallback(
    (result: HeroSearchResult) => {
      setSearchQuery(result.name);
      setIsDropdownOpen(false);

      if (result.type === "company") {
        navigate(localizedPath(currentLanguage, `/companies/${result.id}`));
        return;
      }

      navigate(
        localizedPath(
          currentLanguage,
          getEntityDetailPath("municipality", result.name),
        ),
      );
    },
    [currentLanguage, navigate],
  );

  const handlePopularClick = useCallback(
    (item: (typeof POPULAR_ITEMS)[number]) => {
      if (item.type === "municipality") {
        handleSearchSelection({ type: "municipality", name: item.label });
        return;
      }

      const normalizedLabel = item.label.toLowerCase().replace("6", "&");
      const companyMatch = companies.find((company) => {
        const companyName = company.name.toLowerCase();
        return (
          companyName.includes(item.label.toLowerCase()) ||
          companyName.includes(normalizedLabel)
        );
      });

      if (!companyMatch) {
        return;
      }

      handleSearchSelection({
        type: "company",
        id: String(companyMatch.wikidataId),
        name: companyMatch.name,
      });
    },
    [companies, handleSearchSelection],
  );

  return (
    <LandingSection innerClassName="flex flex-col items-center max-w-4xl mx-auto space-y-16">
      {/* Description */}
      <p className="text-lg md:text-lg text-grey max-w-3xl">
        {t("landingPage.ctaSection.description")}
      </p>

      <div
        ref={searchContainerRef}
        className="relative mt-2 w-full max-w-[22rem]"
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
            aria-hidden="true"
          />
          <Input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsDropdownOpen(false);
              }

              if (event.key === "Enter" && searchResults.length > 0) {
                handleSearchSelection(searchResults[0]);
              }
            }}
            placeholder={t("landingPage.heroSearchPlaceholder")}
            className="h-11 border-white/25 bg-black-2 pl-10 text-white placeholder:text-white/50 focus-visible:ring-white/40"
            aria-label={t("landingPage.heroSearchLabel")}
          />
        </div>

        {isDropdownOpen && searchQuery.trim() && (
          <div className="absolute left-0 top-full z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-md border border-white/10 bg-black-2 shadow-lg">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <button
                  key={`${result.type}-${
                    result.type === "company" ? result.id : result.name
                  }`}
                  type="button"
                  tabIndex={0}
                  onClick={() => handleSearchSelection(result)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                >
                  <span>{result.name}</span>
                  <span className="text-xs text-white/60">
                    {result.type === "company"
                      ? t("landingPage.searchResultType.company")
                      : t("landingPage.searchResultType.municipality")}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-white/60">
                {t("globalSearch.searchDialog.emptyText")}
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex w-full items-center gap-2 overflow-x-auto whitespace-nowrap text-sm">
          <Text className="shrink-0 text-white/70">Popular:</Text>
          {POPULAR_ITEMS.map((item) => (
            <button
              key={`${item.type}-${item.label}`}
              type="button"
              onClick={() => handlePopularClick(item)}
              className="group rounded-md relative shrink-0 overflow-hidden border border-white/20 px-2.5 py-1 hover:opacity-100 active:opacity-100"
            >
              <span
                className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"
                aria-hidden="true"
              />
              <span className="relative z-10 text-white/90 transition-colors duration-500 group-hover:text-black">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
