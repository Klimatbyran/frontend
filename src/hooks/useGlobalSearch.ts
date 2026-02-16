import { useCombinedData } from "./useCombinedData";

const useGlobalSearch = (query: string) => {
  const allData = useCombinedData();

  if (allData.error || allData.loading) {
    return allData;
  }

  const lcQuery = query.toLocaleLowerCase();
  const result =
    lcQuery.length > 1
      ? allData.data
          .filter((item) => item.name.toLocaleLowerCase().includes(lcQuery))
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];

  return {
    ...allData,
    data: result,
  };
};

export default useGlobalSearch;
