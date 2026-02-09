import { useMemo } from "react";
import { useCompanies } from "./companies/useCompanies";
import { useMunicipalities } from "./municipalities/useMunicipalities";
import { useBlogPosts } from "./useBlogPosts";

export type CombinedData = {
  name: string;
  id: string;
  category: "companies" | "municipalities" | "blogPosts";
  blogExcerpt?: string;
};

export const useCombinedData = () => {
  const {
    municipalities,
    municipalitiesLoading: isLoadingMunicipalities,
    municipalitiesError: municipalitiesError,
  } = useMunicipalities();
  const {
    companies,
    companiesLoading: isLoadingCompanies,
    companiesError: companiesError,
  } = useCompanies();
  const { blogPosts, blogPostsLoading, blogPostsError } = useBlogPosts();

  const hasErrors = municipalitiesError || companiesError || blogPostsError;
  const isLoading =
    isLoadingCompanies || isLoadingMunicipalities || blogPostsLoading;

  const combinedData = useMemo(() => {
    if (hasErrors) {
      return {
        loading: false,
        error: new Error("Error fetching municipalities or companies"),
        data: [],
      };
    }

    if (isLoading) {
      return {
        loading: true,
        data: [],
      };
    }

    const mappedMunicipalities: CombinedData[] = municipalities?.map(
      (municipality): CombinedData => ({
        name: municipality.name,
        id: municipality.name,
        category: "municipalities",
      }),
    );

    const mappedCompanies: CombinedData[] = companies?.map(
      (company): CombinedData => {
        return {
          name: company.name,
          id: company.wikidataId,
          category: "companies",
        };
      },
    );

    const mappedBlogPosts: CombinedData[] = blogPosts?.map(
      (blogPost): CombinedData => {
        return {
          name: blogPost.title,
          id: blogPost.id,
          category: "blogPosts",
          blogExcerpt: blogPost.excerpt,
        };
      },
    );

    return {
      loading: false,
      data: [...mappedMunicipalities, ...mappedCompanies, ...mappedBlogPosts],
    };
  }, [municipalities, companies, blogPosts, isLoading, hasErrors]);

  return combinedData;
};

export type CombinedDataResult = ReturnType<typeof useCombinedData>;
