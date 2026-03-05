import { useMemo } from "react";
import { useCompanies } from "./companies/useCompanies";
import { useMunicipalities } from "./municipalities/useMunicipalities";
import { useBlogPosts } from "./useBlogPosts";
import { useRegions } from "./useRegions";
import { useNationalData } from "./useNationalData";

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
  const { regions } = useRegions();
  const { data: nationalData } = useNationalData();

  const hasErrors = municipalitiesError || companiesError || blogPostsError;
  const isLoading =
    isLoadingCompanies || isLoadingMunicipalities || blogPostsLoading;

  const combinedData = useMemo(() => {
    if (hasErrors) {
      return {
        loading: false,
        error: new Error("Error fetching data"),
        data: [],
      };
    }

    if (isLoading) {
      return {
        loading: true,
        data: [],
      };
    }

    const mappedMunicipalities: CombinedData[] =
      municipalities?.map(
        (municipality): CombinedData => ({
          name: municipality.name,
          id: municipality.name,
          category: "municipalities",
        }),
      ) ?? [];

    const mappedCompanies: CombinedData[] =
      companies?.map(
        (company): CombinedData => ({
          name: company.name,
          id: company.wikidataId,
          category: "companies",
        }),
      ) ?? [];

    const mappedBlogPosts: CombinedData[] =
      blogPosts?.map(
        (blogPost): CombinedData => ({
          name: blogPost.title,
          id: blogPost.id,
          category: "blogPosts",
          blogExcerpt: blogPost.excerpt,
        }),
      ) ?? [];

    const mappedRegions: CombinedData[] =
      regions?.map(
        (regionName): CombinedData => ({
          name: regionName,
          id: regionName.toLowerCase(),
          category: "regions",
        }),
      ) ?? [];

    const mappedNations: CombinedData[] = [
      {
        name: nationalData?.country ?? "Sweden",
        id: "nation",
        category: "nations",
      },
    ];

    return {
      loading: false,
      data: [
        ...mappedMunicipalities,
        ...mappedCompanies,
        ...mappedRegions,
        ...mappedNations,
        ...mappedBlogPosts,
      ],
    };
  }, [
    municipalities,
    companies,
    regions,
    nationalData,
    blogPosts,
    isLoading,
    hasErrors,
  ]);

  return combinedData;
};

export type CombinedDataResult = ReturnType<typeof useCombinedData>;
