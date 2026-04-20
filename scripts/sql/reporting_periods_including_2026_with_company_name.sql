-- Query to find all reporting periods that include year 2026
-- Includes any period where startDate OR endDate is in 2026
-- Returns company name + reporting period details

SELECT
  c."name" AS company_name,
  c."wikidataId" AS company_wikidata_id,
  rp."id" AS reporting_period_id,
  rp."year" AS reporting_year,
  rp."startDate" AS start_date,
  rp."endDate" AS end_date,
  CASE
    WHEN rp."startDate" IS NOT NULL AND EXTRACT(YEAR FROM rp."startDate") = 2026 THEN true
    ELSE false
  END AS start_in_2026,
  CASE
    WHEN rp."endDate" IS NOT NULL AND EXTRACT(YEAR FROM rp."endDate") = 2026 THEN true
    ELSE false
  END AS end_in_2026
FROM "public"."ReportingPeriod" rp
JOIN "public"."Company" c
  ON rp."companyId" = c."wikidataId"
WHERE
  (rp."startDate" IS NOT NULL AND EXTRACT(YEAR FROM rp."startDate") = 2026)
  OR
  (rp."endDate" IS NOT NULL AND EXTRACT(YEAR FROM rp."endDate") = 2026)
ORDER BY
  company_name,
  start_date NULLS LAST,
  end_date NULLS LAST;

