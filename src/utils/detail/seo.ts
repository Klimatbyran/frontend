export function createEntityStructuredData(
  name: string,
  type: string,
  region: string,
  pageDescription: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: `${name} ${type}`,
    description: pageDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: name,
      addressRegion: region,
      addressCountry: "SE",
    },
  };
}
