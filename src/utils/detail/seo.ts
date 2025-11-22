export function createMunicipalityStructuredData(
  municipalityName: string,
  municipalityRegion: string,
  pageDescription: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: `${municipalityName} kommun`,
    description: pageDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: municipalityName,
      addressRegion: municipalityRegion,
      addressCountry: "SE",
    },
  };
}
