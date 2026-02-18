-- All companies; one row per unique tag (tag_type): null, empty, or distinct tag set.
-- Focus: 2024 only.
-- Returns: tags, tag_type, per-tag-group counts and company arrays; plus for each data point
--   a count and an array of company names that have that data:
--   scope 1 total, scope 2 market (mb), scope 2 location (lb), scope 2 unknown,
--   scope 1&2 (Scope1And2.total), scope 3 stated total, at least 1 scope 3 category,
--   stated total general (s1+s2+s2_unknown+scope3_stated > 0).
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
    s12."total" AS scope1and2_total,
    (SELECT se."total" FROM "StatedTotalEmissions" se WHERE s3."id" = se."scope3Id") AS scope3_stated_total,
    sp.Scope3_cat_1, sp.Scope3_cat_2, sp.Scope3_cat_3, sp.Scope3_cat_4,
    sp.Scope3_cat_5, sp.Scope3_cat_6, sp.Scope3_cat_7, sp.Scope3_cat_8,
    sp.Scope3_cat_9, sp.Scope3_cat_10, sp.Scope3_cat_11, sp.Scope3_cat_12,
    sp.Scope3_cat_13, sp.Scope3_cat_14, sp.Scope3_cat_15, sp.Scope3_cat_16
  FROM "Emissions" e
  LEFT JOIN "Scope1" s1 ON e."id" = s1."emissionsId"
  LEFT JOIN "Scope2" s2 ON e."id" = s2."emissionsId"
  LEFT JOIN "Scope1And2" s12 ON e."id" = s12."emissionsId"
  LEFT JOIN "Scope3" s3 ON e."id" = s3."emissionsId"
  LEFT JOIN Scope3_pivot sp ON s3."id" = sp."scope3Id"
),
reporting_2024 AS (
  SELECT
    rp."companyId",
    es.s1_total,
    es.s2_mb,
    es.s2_lb,
    es.s2_unknown,
    es.scope1and2_total,
    es.scope3_stated_total,
    es.Scope3_cat_1, es.Scope3_cat_2, es.Scope3_cat_3, es.Scope3_cat_4,
    es.Scope3_cat_5, es.Scope3_cat_6, es.Scope3_cat_7, es.Scope3_cat_8,
    es.Scope3_cat_9, es.Scope3_cat_10, es.Scope3_cat_11, es.Scope3_cat_12,
    es.Scope3_cat_13, es.Scope3_cat_14, es.Scope3_cat_15, es.Scope3_cat_16
  FROM "public"."ReportingPeriod" rp
  LEFT JOIN emissions_with_scopes es ON rp."id" = es."reportingPeriodId"
  WHERE rp."year" = '2024'
),
-- "Has emissions" = any of: stated total, scope 1, scope 2 (mb or lb), stated scope 3, or any scope 3 category
company_2024_has_emissions AS (
  SELECT
    r."companyId",
    (
      (r.s1_total IS NOT NULL)
      OR (r.s2_mb IS NOT NULL OR r.s2_lb IS NOT NULL)
      OR (r.scope3_stated_total IS NOT NULL)
      OR (r.Scope3_cat_1 IS NOT NULL OR r.Scope3_cat_2 IS NOT NULL OR r.Scope3_cat_3 IS NOT NULL OR r.Scope3_cat_4 IS NOT NULL
          OR r.Scope3_cat_5 IS NOT NULL OR r.Scope3_cat_6 IS NOT NULL OR r.Scope3_cat_7 IS NOT NULL OR r.Scope3_cat_8 IS NOT NULL
          OR r.Scope3_cat_9 IS NOT NULL OR r.Scope3_cat_10 IS NOT NULL OR r.Scope3_cat_11 IS NOT NULL OR r.Scope3_cat_12 IS NOT NULL
          OR r.Scope3_cat_13 IS NOT NULL OR r.Scope3_cat_14 IS NOT NULL OR r.Scope3_cat_15 IS NOT NULL OR r.Scope3_cat_16 IS NOT NULL)
    ) AS has_emissions_2024
  FROM reporting_2024 r
),
-- Tag type: null, empty array, or non-empty (we use the actual tags for grouping non-empty)
companies_with_tag_type AS (
  SELECT
    c."wikidataId" AS "companyId",
    c."name" AS company_name,
    c.tags,
    CASE
      WHEN c.tags IS NULL THEN 'null'
      WHEN array_length(c.tags, 1) IS NULL OR c.tags = '{}' THEN 'empty'
      ELSE array_to_string(c.tags, ', ')
    END AS tag_type
  FROM "Company" c
),
-- Only companies that have a 2024 reporting period (with flags per data point)
companies_2024 AS (
  SELECT
    ct."companyId",
    ct.company_name,
    ct.tags,
    ct.tag_type,
    COALESCE(ch.has_emissions_2024, false) AS has_emissions_2024,
    (r.s1_total IS NOT NULL) AS has_scope1_total,
    (r.s2_mb IS NOT NULL) AS has_s2_market,
    (r.s2_lb IS NOT NULL) AS has_s2_location,
    (r.s2_unknown IS NOT NULL) AS has_s2_unknown,
    (r.scope1and2_total IS NOT NULL) AS has_scope1and2,
    (r.scope3_stated_total IS NOT NULL) AS has_scope3_stated_total,
    (r.Scope3_cat_1 IS NOT NULL OR r.Scope3_cat_2 IS NOT NULL OR r.Scope3_cat_3 IS NOT NULL OR r.Scope3_cat_4 IS NOT NULL
     OR r.Scope3_cat_5 IS NOT NULL OR r.Scope3_cat_6 IS NOT NULL OR r.Scope3_cat_7 IS NOT NULL OR r.Scope3_cat_8 IS NOT NULL
     OR r.Scope3_cat_9 IS NOT NULL OR r.Scope3_cat_10 IS NOT NULL OR r.Scope3_cat_11 IS NOT NULL OR r.Scope3_cat_12 IS NOT NULL
     OR r.Scope3_cat_13 IS NOT NULL OR r.Scope3_cat_14 IS NOT NULL OR r.Scope3_cat_15 IS NOT NULL OR r.Scope3_cat_16 IS NOT NULL) AS has_scope3_cat_any,
    ((COALESCE(r.s1_total,0) + COALESCE(NULLIF(r.s2_mb,0), r.s2_lb, 0) + COALESCE(r.s2_unknown,0) + COALESCE(r.scope3_stated_total,0)) > 0) AS has_stated_total_general
  FROM companies_with_tag_type ct
  INNER JOIN reporting_2024 r ON r."companyId" = ct."companyId"
  LEFT JOIN company_2024_has_emissions ch ON ch."companyId" = ct."companyId"
),
-- Per-tag-type aggregates
tag_type_counts AS (
  SELECT
    tag_type,
    COUNT(*) AS count_total,
    COUNT(*) FILTER (WHERE has_emissions_2024) AS count_with_emissions_2024
  FROM companies_2024
  GROUP BY tag_type
),
-- All company names in each tag group (for the full group, not just no-emissions)
tag_type_company_names AS (
  SELECT
    tag_type,
    ARRAY_AGG(company_name ORDER BY company_name) AS companies_in_group
  FROM companies_2024
  GROUP BY tag_type
),
-- Company names in each tag group that had any emissions in 2024
tag_type_companies_with_emissions AS (
  SELECT
    tag_type,
    ARRAY_AGG(company_name ORDER BY company_name) AS companies_with_emissions_2024
  FROM companies_2024
  WHERE has_emissions_2024
  GROUP BY tag_type
),
-- Company names in each tag group with no emissions data in 2024
tag_type_companies_no_emissions AS (
  SELECT
    tag_type,
    ARRAY_AGG(company_name ORDER BY company_name) AS companies_no_emissions_2024
  FROM companies_2024
  WHERE NOT has_emissions_2024
  GROUP BY tag_type
),
-- One representative tags array per tag_type (all companies in a group share the same tags)
tag_type_tags AS (
  SELECT DISTINCT ON (tag_type) tag_type, tags
  FROM companies_2024
  ORDER BY tag_type, company_name
),
-- Per-tag-type count and company list for each data point
tag_type_data_points AS (
  SELECT
    tag_type,
    COUNT(*) FILTER (WHERE has_scope1_total) AS count_scope1_total,
    ARRAY_AGG(company_name ORDER BY company_name) FILTER (WHERE has_scope1_total) AS companies_scope1_total,
    COUNT(*) FILTER (WHERE has_s2_market) AS count_scope2_market,
    ARRAY_AGG(company_name ORDER BY company_name) FILTER (WHERE has_s2_market) AS companies_scope2_market,
    COUNT(*) FILTER (WHERE has_s2_location) AS count_scope2_location,
    ARRAY_AGG(company_name ORDER BY company_name) FILTER (WHERE has_s2_location) AS companies_scope2_location,
    COUNT(*) FILTER (WHERE has_s2_unknown) AS count_scope2_unknown,
    ARRAY_AGG(company_name ORDER BY company_name) FILTER (WHERE has_s2_unknown) AS companies_scope2_unknown,
    COUNT(*) FILTER (WHERE has_scope1and2) AS count_scope1and2,
    ARRAY_AGG(company_name ORDER BY company_name) FILTER (WHERE has_scope1and2) AS companies_scope1and2,
    COUNT(*) FILTER (WHERE has_scope3_stated_total) AS count_scope3_stated_total,
    ARRAY_AGG(company_name ORDER BY company_name) FILTER (WHERE has_scope3_stated_total) AS companies_scope3_stated_total,
    COUNT(*) FILTER (WHERE has_scope3_cat_any) AS count_scope3_cat_any,
    ARRAY_AGG(company_name ORDER BY company_name) FILTER (WHERE has_scope3_cat_any) AS companies_scope3_cat_any,
    COUNT(*) FILTER (WHERE has_stated_total_general) AS count_stated_total_general,
    ARRAY_AGG(company_name ORDER BY company_name) FILTER (WHERE has_stated_total_general) AS companies_stated_total_general
  FROM companies_2024
  GROUP BY tag_type
)
SELECT
  tt.tags,
  t.tag_type,
  t.count_with_emissions_2024,
  t.count_total,
  tn.companies_in_group,
  te.companies_with_emissions_2024,
  tne.companies_no_emissions_2024,
  dp.count_scope1_total,
  dp.companies_scope1_total,
  dp.count_scope2_market,
  dp.companies_scope2_market,
  dp.count_scope2_location,
  dp.companies_scope2_location,
  dp.count_scope2_unknown,
  dp.companies_scope2_unknown,
  dp.count_scope1and2,
  dp.companies_scope1and2,
  dp.count_scope3_stated_total,
  dp.companies_scope3_stated_total,
  dp.count_scope3_cat_any,
  dp.companies_scope3_cat_any,
  dp.count_stated_total_general,
  dp.companies_stated_total_general
FROM tag_type_counts t
JOIN tag_type_tags tt ON tt.tag_type = t.tag_type
JOIN tag_type_company_names tn ON tn.tag_type = t.tag_type
LEFT JOIN tag_type_companies_with_emissions te ON te.tag_type = t.tag_type
LEFT JOIN tag_type_companies_no_emissions tne ON tne.tag_type = t.tag_type
JOIN tag_type_data_points dp ON dp.tag_type = t.tag_type
ORDER BY t.tag_type;

-- Optional: summary only (one row per tag type, no company list):
-- SELECT tag_type, count_with_emissions_2024, count_total
-- FROM tag_type_counts
-- ORDER BY tag_type;
