import { useEffect, useState, useRef } from "react";
import { SearchIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useCombinedData } from "@/hooks/useCombinedData";

type SearchItem = {
  id: string;
  name: string;
  category: "companies" | "municipalities" | "blogPosts";
};

const GlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const combinedData = useCombinedData();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        e.target instanceof Node &&
        !dropdownRef.current?.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsDropdownOpen(true);
    // TODO: Handle error and loading states
    if (!combinedData.error && !combinedData.loading) {
      setSearchResult(
        combinedData.data.filter((item: SearchItem) => {
          return item.name.toLowerCase().includes(searchQuery.toLowerCase());
        }),
      );
    }
  }, [searchQuery, combinedData]);

  return (
    <div className="flex flex-col gap-4 w-[300px] relative">
      <label htmlFor="landingInput" className="text-xl mt-6">
        {t("globalSearch.title")}
      </label>
      <div className="flex gap-2 items-center">
        <Input
          id="landingInput"
          type="text"
          placeholder={t("globalSearch.placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-black-1 placeholder:text-center  h-10 rounded-md px-2 focus:outline-white font-medium focus:text-left focus:ring-1 focus:ring-blue-2 relative w-full"
        />
        {searchQuery ? (
          <X
            onClick={() => setSearchQuery("")}
            className="absolute right-0 -translate-x-2 w-4 h-4 opacity-80 cursor-pointer"
          />
        ) : (
          <SearchIcon className="absolute right-0 -translate-x-2 w-4 h-4 opacity-80" />
        )}
      </div>
      <div
        ref={dropdownRef}
        className={`
          ${searchQuery === "" ? "hidden" : "flex-col"}
          ${isMobile ? "max-h-[250px]" : "max-h-[300px]"}
          ${!isDropdownOpen && "hidden"}
          ${searchResult.length > 0 ? "overflow-y-scroll" : "overflow-y-hidden"}
          w-[300px] top-28 absolute bg-black-2 rounded-xl`}
        style={{
          scrollbarWidth: "thin",
        }}
      >
        {searchResult.length > 0 ? (
          searchResult.map((item) => {
            return (
              <a
                href={`${item.category === "companies" ? "/companies/" : "/municipalities/"}${item.id}`}
                className="text-left text-lg font-md max-w-[300px] p-3 flex justify-between hover:bg-black-1 transition-colors"
                key={item.id}
              >
                {item.name}
                <Text className="text-grey">
                  {item.category === "companies"
                    ? t("globalSearch.searchCategoryCompany")
                    : t("globalSearch.searchCategoryMunicipality")}
                </Text>
              </a>
            );
          })
        ) : (
          <Text className="text-grey text-center text-lg font-md h-14 max-w-[300px] overflow-visible p-3">
            No results found
          </Text>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;
