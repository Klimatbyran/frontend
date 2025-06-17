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
    (SELECT se."total" FROM "StatedTotalEmissions" se WHERE s3."id" = se."scope3Id") as scope3_total,
    (
      COALESCE(sp.Scope3_cat_1,0) + COALESCE(sp.Scope3_cat_2,0) + COALESCE(sp.Scope3_cat_3,0) +
      COALESCE(sp.Scope3_cat_4,0) + COALESCE(sp.Scope3_cat_5,0) + COALESCE(sp.Scope3_cat_6,0) +
      COALESCE(sp.Scope3_cat_7,0) + COALESCE(sp.Scope3_cat_8,0) + COALESCE(sp.Scope3_cat_9,0) +
      COALESCE(sp.Scope3_cat_10,0) + COALESCE(sp.Scope3_cat_11,0) + COALESCE(sp.Scope3_cat_12,0) +
      COALESCE(sp.Scope3_cat_13,0) + COALESCE(sp.Scope3_cat_14,0) + COALESCE(sp.Scope3_cat_15,0) +
      COALESCE(sp.Scope3_cat_16,0)
    ) as scope3_categories_sum,
    sp.*
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
    es.scope3_total,
    es.scope3_categories_sum,
    es.Scope3_cat_1, es.Scope3_cat_2, es.Scope3_cat_3, es.Scope3_cat_4, es.Scope3_cat_5, es.Scope3_cat_6, es.Scope3_cat_7, es.Scope3_cat_8, es.Scope3_cat_9, es.Scope3_cat_10, es.Scope3_cat_11, es.Scope3_cat_12, es.Scope3_cat_13, es.Scope3_cat_14, es.Scope3_cat_15, es.Scope3_cat_16
  FROM "public"."ReportingPeriod" rp
  LEFT JOIN emissions_with_scopes es ON rp."id" = es."reportingPeriodId"
),
company_years AS (
  SELECT
    c."name" AS company_name,
    rwc."companyId",
    rwc."year",
    (rwc.s1_total IS NOT NULL) AS has_scope1,
    (rwc.s2_mb IS NOT NULL OR rwc.s2_lb IS NOT NULL) AS has_scope2,
    (rwc.scope3_total IS NOT NULL) AS has_scope3_stated,
    (rwc.scope3_categories_sum IS NOT NULL AND rwc.scope3_categories_sum != 0) AS has_any_scope3_categories,
    ARRAY[
      CASE WHEN rwc.Scope3_cat_1 IS NOT NULL THEN 1 END,
      CASE WHEN rwc.Scope3_cat_2 IS NOT NULL THEN 2 END,
      CASE WHEN rwc.Scope3_cat_3 IS NOT NULL THEN 3 END,
      CASE WHEN rwc.Scope3_cat_4 IS NOT NULL THEN 4 END,
      CASE WHEN rwc.Scope3_cat_5 IS NOT NULL THEN 5 END,
      CASE WHEN rwc.Scope3_cat_6 IS NOT NULL THEN 6 END,
      CASE WHEN rwc.Scope3_cat_7 IS NOT NULL THEN 7 END,
      CASE WHEN rwc.Scope3_cat_8 IS NOT NULL THEN 8 END,
      CASE WHEN rwc.Scope3_cat_9 IS NOT NULL THEN 9 END,
      CASE WHEN rwc.Scope3_cat_10 IS NOT NULL THEN 10 END,
      CASE WHEN rwc.Scope3_cat_11 IS NOT NULL THEN 11 END,
      CASE WHEN rwc.Scope3_cat_12 IS NOT NULL THEN 12 END,
      CASE WHEN rwc.Scope3_cat_13 IS NOT NULL THEN 13 END,
      CASE WHEN rwc.Scope3_cat_14 IS NOT NULL THEN 14 END,
      CASE WHEN rwc.Scope3_cat_15 IS NOT NULL THEN 15 END,
      CASE WHEN rwc.Scope3_cat_16 IS NOT NULL THEN 16 END
    ] || '{}'::int[] AS scope3_cats,
    c.tags
  FROM reporting_with_company rwc
  LEFT JOIN "Company" c ON rwc."companyId" = c."wikidataId"
),
pairs AS (
  SELECT
    cy24.company_name,
    cy24."year" AS year,
    cy24.has_scope1,
    cy24.has_scope2,
    cy24.has_scope3_stated,
    cy24.has_any_scope3_categories,
    cy24.scope3_cats AS scope3_cats_2024,
    cy23.scope3_cats AS scope3_cats_2023,
    array_length(cy24.scope3_cats, 1) AS scope3_cats_2024_count,
    array_length(cy23.scope3_cats, 1) AS scope3_cats_2023_count,
    cy24.tags,
    (ARRAY(SELECT unnest(cy24.scope3_cats)
           EXCEPT
           SELECT unnest(cy23.scope3_cats)) <> '{}') AS new_scope3_categories
  FROM company_years cy24
  JOIN company_years cy23
    ON cy24."companyId" = cy23."companyId"
    AND cy24.year = '2024'
    AND cy23.year = '2023'
)
SELECT
  company_name,
  has_scope1,
  has_scope2,
  has_scope3_stated,
  has_any_scope3_categories,
  scope3_cats_2023_count,
  scope3_cats_2024_count,
  scope3_cats_2023,
  scope3_cats_2024,
  ARRAY(SELECT unnest(scope3_cats_2024) EXCEPT SELECT unnest(scope3_cats_2023)) AS new_scope3_cats,
  ARRAY(SELECT unnest(scope3_cats_2023) EXCEPT SELECT unnest(scope3_cats_2024)) AS old_scope3_cats,
  tags,
  new_scope3_categories
FROM pairs
WHERE new_scope3_categories
  AND scope3_cats_2024_count > scope3_cats_2023_count
ORDER BY company_name; 