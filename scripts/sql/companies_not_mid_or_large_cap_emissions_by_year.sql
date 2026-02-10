-- Companies that do NOT have "mid-cap" or "large-cap" in the tags array,
-- with scope totals and scope 3 category values per year (one row per company per year).
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
)
SELECT
  c."name" AS company,
  c.tags,
  rwc."year",
  rwc.s1_total AS scope_1_total,
  COALESCE(NULLIF(rwc.s2_mb, 0), rwc.s2_lb) AS scope_2_total,
  rwc.scope3_stated_total AS scope_3_stated_total,
  rwc.Scope3_cat_1,
  rwc.Scope3_cat_2,
  rwc.Scope3_cat_3,
  rwc.Scope3_cat_4,
  rwc.Scope3_cat_5,
  rwc.Scope3_cat_6,
  rwc.Scope3_cat_7,
  rwc.Scope3_cat_8,
  rwc.Scope3_cat_9,
  rwc.Scope3_cat_10,
  rwc.Scope3_cat_11,
  rwc.Scope3_cat_12,
  rwc.Scope3_cat_13,
  rwc.Scope3_cat_14,
  rwc.Scope3_cat_15,
  rwc.Scope3_cat_16
FROM reporting_with_company rwc
JOIN "Company" c ON rwc."companyId" = c."wikidataId"
WHERE (c.tags IS NULL OR (NOT ('mid-cap' = ANY(c.tags)) AND NOT ('large-cap' = ANY(c.tags))))
ORDER BY c."name", rwc."year";
