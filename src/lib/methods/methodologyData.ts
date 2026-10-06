// This file contains the structure of methodology sections and their relationships

export type MethodType = {
  id: string;
  category: string;
};

export type MethodologySectionType = {
  [category: string]: MethodType[];
};

// Main categories and methods
export const methodologySections: MethodologySectionType = {
  general: [
    { id: "parisAgreement", category: "general" },
    { id: "carbonLaw", category: "general" },
    // { id: "trendline", category: "general" },
    // { id: "parisAlignment", category: "general" },
    // { id: "interpretingOnTrack", category: "general" },
    { id: "emissionTypes", category: "general" },
    { id: "peerComparison", category: "general" },
  ],
  municipalityAndRegion: [
    {
      id: "municipalityAndRegionDataOverview",
      category: "municipalityAndRegion",
    },
    { id: "sources", category: "municipalityAndRegion" },
    { id: "municipalityKPIs", category: "municipalityAndRegion" },
  ],
  nation: [{ id: "nationEmissionsLayers", category: "nation" }],
  company: [
    { id: "companyDataOverview", category: "company" },
    { id: "companyDataCollection", category: "company" },
    { id: "emissionCategories", category: "company" },
    { id: "historicalData", category: "company" },
    { id: "relatableNumbers", category: "company" },
  ],
};

// Function to get a method by ID
export const getMethodById = (id: string): MethodType | undefined => {
  for (const category in methodologySections) {
    const method = methodologySections[category].find((m) => m.id === id);
    if (method) return method;
  }
  return undefined;
};

// Function to get all methods as a flat array
export const getAllMethods = (): MethodType[] => {
  return Object.values(methodologySections).flat();
};
