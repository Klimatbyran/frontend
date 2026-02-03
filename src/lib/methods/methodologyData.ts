// This file contains the structure of methodology sections and their relationships

export type MethodType = {
  id: string;
  relatedMethods?: string[];
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
  ],
  municipality: [
    { id: "municipalityDataOverview", category: "municipality" },
    { id: "sources", category: "municipality" },
    { id: "municipalityKPIs", category: "municipality" },
  ],
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

// Function to get related methods
export const getRelatedMethods = (methodId: string): MethodType[] => {
  const method = getMethodById(methodId);
  if (!method || !method.relatedMethods || method.relatedMethods.length === 0) {
    return [];
  }

  return method.relatedMethods
    .map((id) => getMethodById(id))
    .filter((m): m is MethodType => m !== undefined);
};

// Function to get all methods as a flat array
export const getAllMethods = (): MethodType[] => {
  return Object.values(methodologySections).flat();
};
