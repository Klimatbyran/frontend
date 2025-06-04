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
    { id: "co2Budgets", category: "general" },
    { id: "emissionTypes", category: "general" },
  ],
  municipality: [
    { id: "sources", category: "municipality" },
    { id: "calculations", category: "municipality" },
  ],
  company: [
    { id: "companyDataOverview", category: "company" },
    { id: "companyDataCollection", category: "company" },
    { id: "emissionCategories", category: "company" },
    { id: "historicalData", category: "company" },
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

// Search-related terms mapping
const searchTerms: { [key: string]: string[] } = {
  parisAgreement: [
    "climate goals",
    "1.5°C",
    "global warming",
    "emissions reduction",
    "climate treaty",
  ],
  co2Budgets: [
    "carbon budget",
    "emissions allowance",
    "CO2 allowance",
    "carbon allowance",
    "climate budget",
  ],
  emissionTypes: [
    "greenhouse gases",
    "GHG",
    "carbon dioxide",
    "methane",
    "emissions categories",
  ],
  sources: [
    "data sources",
    "public data",
    "statistics",
    "references",
    "information sources",
  ],
  calculations: [
    "methodology",
    "computation",
    "analysis",
    "measurement",
    "data processing",
  ],
  companyDataOverview: [
    "company overview",
    "business data",
    "corporate information",
    "company scope",
  ],
  companyDataCollection: [
    "data collection",
    "reporting methodology",
    "data gathering",
    "company reporting",
  ],
  emissionCategories: [
    "emission types",
    "scope categories",
    "emission classification",
    "GHG categories",
  ],
  historicalData: [
    "historical emissions",
    "past data",
    "emission history",
    "previous years",
    "trends",
  ],
};

// Enhanced search function that includes related terms and translations
export const searchMethods = (query: string): MethodType[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  return getAllMethods().filter((method) => {
    // Check method ID
    if (method.id.toLowerCase().includes(lowerQuery)) return true;

    // Check related terms
    const terms = searchTerms[method.id] || [];
    if (terms.some((term) => term.toLowerCase().includes(lowerQuery)))
      return true;

    // Check if query matches any part of the method's content
    const methodContent = [
      `methodsPage.accordion.${method.id}.title`,
      `methodsPage.accordion.${method.id}.description`,
      `methodsPage.categories.${method.category}`,
    ]
      .join(" ")
      .toLowerCase();

    return methodContent.includes(lowerQuery);
  });
};
