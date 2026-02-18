-- Small cap companies (no mid-cap, large-cap; exclude Folksam). Single row with counts:
-- 2024: (1) companies reporting scope 1 + scope 2 + scope 3, (2) only stated total, (3) >1 scope 3 category
-- All years: (4) companies with any emissions in 3+ years, (5) companies with all three scopes in 3+ years
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
    s2."unknown" AS s2_unknown,
    (SELECT se."total" FROM "StatedTotalEmissions" se WHERE s3."id" = se."scope3Id") AS scope3_stated_total,
    (SELECT ste."total" FROM "StatedTotalEmissions" ste WHERE ste."emissionsId" = e."id" AND ste."scope3Id" IS NULL LIMIT 1) AS stated_total_emissions,
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
    es.s2_unknown,
    es.scope3_stated_total,
    es.stated_total_emissions,
    es.Scope3_cat_1, es.Scope3_cat_2, es.Scope3_cat_3, es.Scope3_cat_4,
    es.Scope3_cat_5, es.Scope3_cat_6, es.Scope3_cat_7, es.Scope3_cat_8,
    es.Scope3_cat_9, es.Scope3_cat_10, es.Scope3_cat_11, es.Scope3_cat_12,
    es.Scope3_cat_13, es.Scope3_cat_14, es.Scope3_cat_15, es.Scope3_cat_16
  FROM "public"."ReportingPeriod" rp
  LEFT JOIN emissions_with_scopes es ON rp."id" = es."reportingPeriodId"
),
small_cap_rwc AS (
  SELECT rwc.*
  FROM reporting_with_company rwc
  JOIN "Company" c ON rwc."companyId" = c."wikidataId"
  WHERE (c.tags IS NULL OR (NOT ('mid-cap' = ANY(c.tags)) AND NOT ('large-cap' = ANY(c.tags))))
    AND c."name" != 'Folksam'
),
-- 2024: one row per company with flags
y2024 AS (
  SELECT
    "companyId",
    (s1_total IS NOT NULL) AS has_scope1,
    (s2_mb IS NOT NULL OR s2_lb IS NOT NULL OR s2_unknown IS NOT NULL) AS has_scope2,
    (scope3_stated_total IS NOT NULL
     OR Scope3_cat_1 IS NOT NULL OR Scope3_cat_2 IS NOT NULL OR Scope3_cat_3 IS NOT NULL OR Scope3_cat_4 IS NOT NULL
     OR Scope3_cat_5 IS NOT NULL OR Scope3_cat_6 IS NOT NULL OR Scope3_cat_7 IS NOT NULL OR Scope3_cat_8 IS NOT NULL
     OR Scope3_cat_9 IS NOT NULL OR Scope3_cat_10 IS NOT NULL OR Scope3_cat_11 IS NOT NULL OR Scope3_cat_12 IS NOT NULL
     OR Scope3_cat_13 IS NOT NULL OR Scope3_cat_14 IS NOT NULL OR Scope3_cat_15 IS NOT NULL OR Scope3_cat_16 IS NOT NULL) AS has_scope3,
    (stated_total_emissions IS NOT NULL) AS has_stated_total,
    (
      (Scope3_cat_1 IS NOT NULL)::int + (Scope3_cat_2 IS NOT NULL)::int + (Scope3_cat_3 IS NOT NULL)::int + (Scope3_cat_4 IS NOT NULL)::int
      + (Scope3_cat_5 IS NOT NULL)::int + (Scope3_cat_6 IS NOT NULL)::int + (Scope3_cat_7 IS NOT NULL)::int + (Scope3_cat_8 IS NOT NULL)::int
      + (Scope3_cat_9 IS NOT NULL)::int + (Scope3_cat_10 IS NOT NULL)::int + (Scope3_cat_11 IS NOT NULL)::int + (Scope3_cat_12 IS NOT NULL)::int
      + (Scope3_cat_13 IS NOT NULL)::int + (Scope3_cat_14 IS NOT NULL)::int + (Scope3_cat_15 IS NOT NULL)::int + (Scope3_cat_16 IS NOT NULL)::int
    ) AS num_scope3_cats
  FROM small_cap_rwc
  WHERE "year" = '2024'
),
-- 2024 counts and company name arrays
count_2024_all_three AS (
  SELECT
    COUNT(*) AS n,
    COALESCE(ARRAY_AGG(c."name" ORDER BY c."name"), '{}') AS companies
  FROM y2024 y
  JOIN "Company" c ON c."wikidataId" = y."companyId"
  WHERE y.has_scope1 AND y.has_scope2 AND y.has_scope3
),
count_2024_only_stated_total AS (
  SELECT
    COUNT(*) AS n,
    COALESCE(ARRAY_AGG(c."name" ORDER BY c."name"), '{}') AS companies
  FROM y2024 y
  JOIN "Company" c ON c."wikidataId" = y."companyId"
  WHERE y.has_stated_total AND NOT y.has_scope1 AND NOT y.has_scope2 AND NOT y.has_scope3
),
count_2024_gt1_scope3_cat AS (
  SELECT
    COUNT(*) AS n,
    COALESCE(ARRAY_AGG(c."name" ORDER BY c."name"), '{}') AS companies
  FROM y2024 y
  JOIN "Company" c ON c."wikidataId" = y."companyId"
  WHERE y.num_scope3_cats > 1
),
-- All years: per company, count years with any emissions and years with all three scopes
company_year_flags AS (
  SELECT
    "companyId",
    "year",
    (s1_total IS NOT NULL OR s2_mb IS NOT NULL OR s2_lb IS NOT NULL OR s2_unknown IS NOT NULL
     OR scope3_stated_total IS NOT NULL OR stated_total_emissions IS NOT NULL
     OR Scope3_cat_1 IS NOT NULL OR Scope3_cat_2 IS NOT NULL OR Scope3_cat_3 IS NOT NULL OR Scope3_cat_4 IS NOT NULL
     OR Scope3_cat_5 IS NOT NULL OR Scope3_cat_6 IS NOT NULL OR Scope3_cat_7 IS NOT NULL OR Scope3_cat_8 IS NOT NULL
     OR Scope3_cat_9 IS NOT NULL OR Scope3_cat_10 IS NOT NULL OR Scope3_cat_11 IS NOT NULL OR Scope3_cat_12 IS NOT NULL
     OR Scope3_cat_13 IS NOT NULL OR Scope3_cat_14 IS NOT NULL OR Scope3_cat_15 IS NOT NULL OR Scope3_cat_16 IS NOT NULL) AS has_any_emissions,
    ((s1_total IS NOT NULL)
     AND (s2_mb IS NOT NULL OR s2_lb IS NOT NULL OR s2_unknown IS NOT NULL)
     AND (scope3_stated_total IS NOT NULL
          OR Scope3_cat_1 IS NOT NULL OR Scope3_cat_2 IS NOT NULL OR Scope3_cat_3 IS NOT NULL OR Scope3_cat_4 IS NOT NULL
          OR Scope3_cat_5 IS NOT NULL OR Scope3_cat_6 IS NOT NULL OR Scope3_cat_7 IS NOT NULL OR Scope3_cat_8 IS NOT NULL
          OR Scope3_cat_9 IS NOT NULL OR Scope3_cat_10 IS NOT NULL OR Scope3_cat_11 IS NOT NULL OR Scope3_cat_12 IS NOT NULL
          OR Scope3_cat_13 IS NOT NULL OR Scope3_cat_14 IS NOT NULL OR Scope3_cat_15 IS NOT NULL OR Scope3_cat_16 IS NOT NULL)) AS has_all_three_scopes
  FROM small_cap_rwc
),
company_years_agg AS (
  SELECT
    "companyId",
    COUNT(*) FILTER (WHERE has_any_emissions) AS years_with_any_emissions,
    COUNT(*) FILTER (WHERE has_all_three_scopes) AS years_with_all_three
  FROM company_year_flags
  GROUP BY "companyId"
),
count_3yr_any AS (
  SELECT
    COUNT(*) AS n,
    COALESCE(ARRAY_AGG(c."name" ORDER BY c."name"), '{}') AS companies
  FROM company_years_agg a
  JOIN "Company" c ON c."wikidataId" = a."companyId"
  WHERE a.years_with_any_emissions >= 3
),
count_3yr_all_three AS (
  SELECT
    COUNT(*) AS n,
    COALESCE(ARRAY_AGG(c."name" ORDER BY c."name"), '{}') AS companies
  FROM company_years_agg a
  JOIN "Company" c ON c."wikidataId" = a."companyId"
  WHERE a.years_with_all_three >= 3
)
SELECT
  COALESCE((SELECT n FROM count_2024_all_three), 0) AS count_2024_scope1_and_2_and_3,
  COALESCE((SELECT companies FROM count_2024_all_three), '{}') AS companies_2024_scope1_and_2_and_3,
  COALESCE((SELECT n FROM count_2024_only_stated_total), 0) AS count_2024_only_stated_total,
  COALESCE((SELECT companies FROM count_2024_only_stated_total), '{}') AS companies_2024_only_stated_total,
  COALESCE((SELECT n FROM count_2024_gt1_scope3_cat), 0) AS count_2024_more_than_1_scope3_cat,
  COALESCE((SELECT companies FROM count_2024_gt1_scope3_cat), '{}') AS companies_2024_more_than_1_scope3_cat,
  COALESCE((SELECT n FROM count_3yr_any), 0) AS count_companies_any_emissions_3_or_more_years,
  COALESCE((SELECT companies FROM count_3yr_any), '{}') AS companies_any_emissions_3_or_more_years,
  COALESCE((SELECT n FROM count_3yr_all_three), 0) AS count_companies_all_three_scopes_3_or_more_years,
  COALESCE((SELECT companies FROM count_3yr_all_three), '{}') AS companies_all_three_scopes_3_or_more_years;
