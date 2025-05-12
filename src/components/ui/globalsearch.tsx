import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type SearchItem = {
  id: string;
  name: string;
  category: "companies" | "municipalities";
};

const GlobalSearch = ({ combinedData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchItem[]>([]);

  
  useEffect(() => {
    setSearchResult(
      combinedData?.filter((item: SearchItem) => {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }),
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-2 w-[300px] relative">
      <div className="flex gap-2">
        <Input
          id="landingInput"
          type="text"
          placeholder="e.g Alfa Laval"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-solid border-white h-[40px] rounded-full px-4 text-base text-lg focus:outline-white font-medium focus:ring-1 focus:ring-blue-2 relative w-full text-center "
        />
      </div>
      <div
        className={`${searchQuery === "" ? "hidden" : "flex-col"}  max-h-[290px] top-10 min-w-[300px] max-w-[300px] mt-2 overflow-y-scroll absolute bg-[#121212] rounded-xl`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#f1f1f1",
        }}
      >
        {searchResult &&
          searchResult.map((item) => {
            return (
              <a
                href={`${item.category === "companies" ? "/companies/" : "/municipalities/"}${item?.id}`}
                className="text-left text-lg font-md max-w-[300px] p-3 flex justify-between hover:bg-black-1 transition-colors"
                key={item?.id}
              >
                {item?.name}
                <Text className="opacity-60">
                  {item.category === "companies" ? "Company" : "Municipality"}
                </Text>
              </a>
            );
          })}
      </div>
    </div>
  );
};

export default GlobalSearch;
