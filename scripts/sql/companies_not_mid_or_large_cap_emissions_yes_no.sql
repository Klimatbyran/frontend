-- Companies that do NOT have "mid-cap" or "large-cap" in the tags array.
-- One row per company: company name, tags, emissions yes/no, and (if yes) array of years with data.
-- Uses same base as companies_not_mid_or_large_cap_emissions_by_year.sql
WITH Scope3_pivot AS (
  SELECT
    "scope3Id",
    MAX(CASE WHEN "category" = '1' THEN "total" END) AS Scope3_cat_1,
    MAX(CASE WHEN "category" = '2' THEN "total" END) AS Scope3_cat_2,
    MAX(CASE WHEN "category" = '3' THEN "total" END) AS Scope3_cat_3,
    MAX(CASE WHEN "category" = '4' THEN "total" END) AS Scope3_cat_4,
    MAX(CASE WHEN "category" = '5' THEN "total" END) AS Scope3_cat_5,
    MAX(CASE WHEN "category" = '6' THEN "total" END) AS Scope3_cat_6,
    MAX(CASE WHEN "category" = '7' THEN "total" END) AS Scope3_cat_7,
    MAX(CASE WHEN "category" = '8' THEN "total" END) AS Scope3_cat_8,
    MAX(CASE WHEN "category" = '9' THEN "total" END) AS Scope3_cat_9,
    MAX(CASE WHEN "category" = '10' THEN "total" END) AS Scope3_cat_10,
    MAX(CASE WHEN "category" = '11' THEN "total" END) AS Scope3_cat_11,
    MAX(CASE WHEN "category" = '12' THEN "total" END) AS Scope3_cat_12,
    MAX(CASE WHEN "category" = '13' THEN "total" END) AS Scope3_cat_13,
    MAX(CASE WHEN "category" = '14' THEN "total" END) AS Scope3_cat_14,
    MAX(CASE WHEN "category" = '15' THEN "total" END) AS Scope3_cat_15,
    MAX(CASE WHEN "category" = '16' THEN "total" END) AS Scope3_cat_16
  FROM "public"."Scope3Category"
  GROUP BY "scope3Id"
),
emissions_with_scopes AS (
  SELECT
    e."id" AS emissions_id,
    e."reportingPeriodId",
    s1."total" AS s1_total,
    s2."mb" AS s2_mb,
    s2."lb" AS s2_lb,
    (SELECT se."total" FROM "StatedTotalEmissions" se WHERE s3."id" = se."scope3Id") AS scope3_stated_total,
    sp.Scope3_cat_1, sp.Scope3_cat_2, sp.Scope3_cat_3, sp.Scope3_cat_4,
    sp.Scope3_cat_5, sp.Scope3_cat_6, sp.Scope3_cat_7, sp.Scope3_cat_8,
    sp.Scope3_cat_9, sp.Scope3_cat_10, sp.Scope3_cat_11, sp.Scope3_cat_12,
    sp.Scope3_cat_13, sp.Scope3_cat_14, sp.Scope3_cat_15, sp.Scope3_cat_16
  FROM "Emissions" e
  LEFT JOIN "Scope1" s1 ON e."id" = s1."emissionsId"
  LEFT JOIN "Scope2" s2 ON e."id" = s2."emissionsId"
  LEFT JOIN "Scope3" s3 ON e."id" = s3."emissionsId"
  LEFT JOIN Scope3_pivot sp ON s3."id" = sp."scope3Id"
),
reporting_with_company AS (
  SELECT
    rp."companyId",
    rp."year",
    es.s1_total,
    es.s2_mb,
    es.s2_lb,
    es.scope3_stated_total,
    es.Scope3_cat_1, es.Scope3_cat_2, es.Scope3_cat_3, es.Scope3_cat_4,
    es.Scope3_cat_5, es.Scope3_cat_6, es.Scope3_cat_7, es.Scope3_cat_8,
    es.Scope3_cat_9, es.Scope3_cat_10, es.Scope3_cat_11, es.Scope3_cat_12,
    es.Scope3_cat_13, es.Scope3_cat_14, es.Scope3_cat_15, es.Scope3_cat_16
  FROM "public"."ReportingPeriod" rp
  LEFT JOIN emissions_with_scopes es ON rp."id" = es."reportingPeriodId"
),
company_year_has_data AS (
  SELECT
    rwc."companyId",
    rwc."year",
    (
      (rwc.s1_total IS NOT NULL)
      OR (rwc.s2_mb IS NOT NULL OR rwc.s2_lb IS NOT NULL)
      OR (rwc.scope3_stated_total IS NOT NULL)
      OR (rwc.Scope3_cat_1 IS NOT NULL OR rwc.Scope3_cat_2 IS NOT NULL OR rwc.Scope3_cat_3 IS NOT NULL OR rwc.Scope3_cat_4 IS NOT NULL
          OR rwc.Scope3_cat_5 IS NOT NULL OR rwc.Scope3_cat_6 IS NOT NULL OR rwc.Scope3_cat_7 IS NOT NULL OR rwc.Scope3_cat_8 IS NOT NULL
          OR rwc.Scope3_cat_9 IS NOT NULL OR rwc.Scope3_cat_10 IS NOT NULL OR rwc.Scope3_cat_11 IS NOT NULL OR rwc.Scope3_cat_12 IS NOT NULL
          OR rwc.Scope3_cat_13 IS NOT NULL OR rwc.Scope3_cat_14 IS NOT NULL OR rwc.Scope3_cat_15 IS NOT NULL OR rwc.Scope3_cat_16 IS NOT NULL)
    ) AS has_emissions_data
  FROM reporting_with_company rwc
),
company_emissions_summary AS (
  SELECT
    "companyId",
    CASE WHEN BOOL_OR(has_emissions_data) THEN 'Yes' ELSE 'No' END AS emissions_yes_no,
    ARRAY_AGG("year" ORDER BY "year") FILTER (WHERE has_emissions_data) AS years_with_data
  FROM company_year_has_data
  GROUP BY "companyId"
)
SELECT
  c."name" AS company_name,
  c.tags,
  COALESCE(ces.emissions_yes_no, 'No') AS emissions_yes_no,
  ces.years_with_data
FROM "Company" c
LEFT JOIN company_emissions_summary ces ON c."wikidataId" = ces."companyId"
WHERE (c.tags IS NULL OR (NOT ('mid-cap' = ANY(c.tags)) AND NOT ('large-cap' = ANY(c.tags))))
ORDER BY c."name";
