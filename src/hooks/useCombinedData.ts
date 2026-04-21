import { useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useBlogPosts } from "./useBlogPosts";

export type CombinedData = {
  name: string;
  id: string;
  category:
    | "companies"
    | "municipalities"
    | "blogPosts"
    | "regions"
    | "nations";
  blogExcerpt?: string;
};

export const useCombinedData = (
  searchResults: any[] = [],
  searchQuery: string = "",
) => {
  const { currentLanguage } = useLanguage();
  const { blogPosts } = useBlogPosts();

  const combinedData = useMemo(() => {
    const lcQuery = searchQuery.trim().toLowerCase();
    const filteredBlogPosts =
      lcQuery.length > 1
        ? (blogPosts ?? []).filter(
            (post) =>
              post.title.toLowerCase().includes(lcQuery) ||
              (post.excerpt && post.excerpt.toLowerCase().includes(lcQuery)),
          )
        : [];

    const mappedData: CombinedData[] = [
      ...searchResults.map((item) => {
        if (item.type === "nation" && item.country) {
          return {
            name:
              item.country[currentLanguage] ||
              item.country.sv ||
              item.country.en,
            id: "nation",
            category: "nations" as CombinedData["category"],
          };
        }
        // Map other types as needed
        let category: CombinedData["category"];
        if (item.type === "company") category = "companies";
        else if (item.type === "municipality") category = "municipalities";
        else if (item.type === "region") category = "regions";
        else category = "nations";
        return {
          name: item.name,
          id: item.id || item.name,
          category,
        };
      }),
      ...filteredBlogPosts.map((blogPost) => ({
        name: blogPost.title,
        id: blogPost.id,
        category: "blogPosts" as CombinedData["category"],
        blogExcerpt: blogPost.excerpt,
      })),
    ];
    return {
      loading: false,
      data: mappedData,
    };
  }, [searchResults, currentLanguage, blogPosts, searchQuery]);

  return combinedData;
};

export type CombinedDataResult = ReturnType<typeof useCombinedData>;
