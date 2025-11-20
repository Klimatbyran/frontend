
export const blogMetadata: { id: string, displayLanguages: string[]}[] = [
  { id: "municipality-method-update", displayLanguages: ["sv", "en"] },
  { id: "only-radical-futures-left", displayLanguages: ["sv", "en"] },
  { id: "carbon-law-from-2025", displayLanguages: ["sv", "en"] },
  { id: "2024-report", displayLanguages: ["sv", "en"] },
  { id: "hållbara-kolet", displayLanguages: ["sv"] },
  { id: "ai-process-del-1", displayLanguages: ["sv","all"] },
  { id: "metod", displayLanguages: ["sv","all"] },
  { id: "welcome", displayLanguages: ["sv"] },
  { id: "klimatmal", displayLanguages: ["sv"] },
  { id: "utslappsberakning", displayLanguages: ["sv"] },
];

export const blogMetadataByLanguage = {
  en: blogMetadata.filter(post => 
    post.displayLanguages.includes('en') || 
    post.displayLanguages.includes('all')
  ),
  sv: blogMetadata.filter(post => 
    post.displayLanguages.includes('sv') || 
    post.displayLanguages.includes('all')
  )
};
