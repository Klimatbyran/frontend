import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { SearchIcon, X } from "lucide-react";
import { CombinedData } from "@/hooks/useCombinedData";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useTranslation } from "react-i18next";

interface GlobalSearchProps {
  combinedData: CombinedData[];
}

type SearchItem = {
  id: string;
  name: string;
  category: "companies" | "municipalities";
};

const GlobalSearch = ({ combinedData }: GlobalSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const dropdownRef = useRef(null);
  console.log(window.screenTop);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = (e) => {
      console.log(window.scrollY);
      if (window.scrollY > 500) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  useEffect(() => {
    setIsDropdownOpen(true);
    setSearchResult(
      combinedData?.filter((item: SearchItem) => {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }),
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-2 w-[300px] relative">
      <label htmlFor="landingInput" className="text-xl mt-6">
        {t("globalSearch.title")}
      </label>
      <div className="flex gap-2 items-center">
        <Input
          id="landingInput"
          type="text"
          placeholder="e.g Alfa Laval"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-black-1 placeholder:text-center relative h-10 rounded-md px-2 text-base text-lg focus:outline-white font-medium focus:text-left focus:ring-1 focus:ring-blue-2 relative w-full"
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
          w-[300px] top-28 overflow-y-scroll absolute bg-[#121212] rounded-xl`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#f1f1f1",
        }}
      >
        {searchResult.length > 0 ? (
          searchResult.map((item) => {
            return (
              <a
                href={`${item.category === "companies" ? "/companies/" : "/municipalities/"}${item?.id}`}
                className="text-left text-lg font-md max-w-[300px] p-3 flex justify-between hover:bg-black-1 transition-colors overflow-y-hidden"
                key={item?.id}
              >
                {item?.name}
                <Text className="opacity-60">
                  {item.category === "companies"
                    ? `${t("globalSearch.searchCategoryCompany")}`
                    : `${t("globalSearch.searchCategoryMunicipality")}`}
                </Text>
              </a>
            );
          })
        ) : (
          <Text className="opacity-60 text-center text-lg font-md h-14 max-w-[300px] overflow-visible p-3">
            No results found
          </Text>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;
