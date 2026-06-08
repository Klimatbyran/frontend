export function isWikidataId(param: string): boolean {
  return /^Q\d+$/.test(param);
}

export function isFullCompanyUuid(param: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    param,
  );
}

/** Public URL segment: prefer wikidataId, else first UUID segment (8 hex chars). */
export function getCompanyUrlSegment(company: {
  id: string;
  wikidataId?: string | null;
}): string {
  return company.wikidataId ?? company.id.split("-")[0];
}

export function getCompanyDetailPath(
  company: { id: string; wikidataId?: string | null },
  basePath = "",
): string {
  return `${basePath}/companies/${getCompanyUrlSegment(company)}`;
}
