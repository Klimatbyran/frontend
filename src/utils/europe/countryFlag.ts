const FLAG_CDN_BASE = "https://flagcdn.com";

export function getCountryFlagUrl(iso2: string, width = 160): string {
  return `${FLAG_CDN_BASE}/w${width}/${iso2.toLowerCase()}.png`;
}
