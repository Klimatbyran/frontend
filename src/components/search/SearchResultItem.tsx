import { useTranslation } from "react-i18next";
import type { CombinedData } from "@/hooks/useCombinedData";

const resultTypeTranslationKeys = {
  companies: "globalSearch.searchCategoryCompany",
  municipalities: "globalSearch.searchCategoryMunicipality",
  blogPosts: "globalSearch.searchCategoryBlogPost",
} as const;

const SearchResultItem = ({ item }: { item: CombinedData }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center w-full text-sm text-gray-500 hover:cursor-pointer">
      <span>{item.name}</span>
      <span className="ml-auto mr-2 min-w-[120px] text-right">
        {t(resultTypeTranslationKeys[item.category])}
      </span>
    </div>
  );
};

export default SearchResultItem;
