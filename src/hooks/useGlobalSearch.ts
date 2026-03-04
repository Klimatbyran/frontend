import { useCombinedData } from "./useCombinedData";

const useGlobalSearch = (query: string) => {
  const allData = useCombinedData();

  if (allData.error || allData.loading) {
    return allData;
  }

  const lcQuery = query.toLocaleLowerCase();
  const normalizedData = allData.data.map((item) => {
    const base = item.name.toLocaleLowerCase();

    let aliases: string[] = [];
    if (item.category === "nations") {
      const nameLc = item.name.toLocaleLowerCase();
      aliases.push(`nation ${nameLc}`);

      // Hard-code Swedish alias for Sweden so "sverige"/"nation sverige" work
      if (nameLc === "sweden") {
        aliases.push("sverige", "nation sverige");
      }
    }

    return {
      item,
      searchable: [base, ...aliases].join(" ").trim(),
    };
  });

  const result =
    lcQuery.length > 1
      ? normalizedData
          .filter(({ searchable }) => searchable.includes(lcQuery))
          .map(({ item }) => item)
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];

  return {
    ...allData,
    data: result,
  };
};

export default useGlobalSearch;
