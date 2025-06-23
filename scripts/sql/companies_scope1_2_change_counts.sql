WITH emissions_with_scopes AS (
  SELECT
    e."id" AS emissions_id,
    e."reportingPeriodId",
    s1."total" AS s1_total,
    s2."mb" AS s2_mb,
    s2."lb" AS s2_lb
  FROM "Emissions" e
  LEFT JOIN "Scope1" s1 ON e."id" = s1."emissionsId"
  LEFT JOIN "Scope2" s2 ON e."id" = s2."emissionsId"
),
reporting_with_company AS (
  SELECT
    rp."companyId",
    rp."year",
    es.s1_total,
    es.s2_mb,
    es.s2_lb
  FROM "public"."ReportingPeriod" rp
  LEFT JOIN emissions_with_scopes es ON rp."id" = es."reportingPeriodId"
),
pivoted AS (
  SELECT
    rwc."companyId",
    MAX(CASE WHEN rwc."year" = '2023' THEN rwc.s1_total END) AS s1_2023,
    MAX(CASE WHEN rwc."year" = '2023' THEN rwc.s2_mb END) AS s2_mb_2023,
    MAX(CASE WHEN rwc."year" = '2023' THEN rwc.s2_lb END) AS s2_lb_2023,
    MAX(CASE WHEN rwc."year" = '2024' THEN rwc.s1_total END) AS s1_2024,
    MAX(CASE WHEN rwc."year" = '2024' THEN rwc.s2_mb END) AS s2_mb_2024,
    MAX(CASE WHEN rwc."year" = '2024' THEN rwc.s2_lb END) AS s2_lb_2024
  FROM reporting_with_company rwc
  GROUP BY rwc."companyId"
),
scope1_2_totals AS (
  SELECT
    "companyId",
    s1_2023, s2_mb_2023, s2_lb_2023,
    s1_2024, s2_mb_2024, s2_lb_2024,
    (COALESCE(s1_2023,0) + COALESCE(NULLIF(s2_mb_2023,0), s2_lb_2023, 0)) AS total_2023,
    (COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0)) AS total_2024
  FROM pivoted
  WHERE (s1_2023 IS NOT NULL OR s2_mb_2023 IS NOT NULL OR s2_lb_2023 IS NOT NULL)
    AND (s1_2024 IS NOT NULL OR s2_mb_2024 IS NOT NULL OR s2_lb_2024 IS NOT NULL)
)
SELECT
  COUNT(*) FILTER (WHERE ((total_2024 - total_2023) / total_2023) * 100 <= -12) AS num_decreased_12_or_more,
  COUNT(*) FILTER (WHERE ((total_2024 - total_2023) / total_2023) * 100 > 0) AS num_increased
FROM scope1_2_totals
WHERE
  total_2023 > 0 AND total_2024 > 0
  AND s1_2023 > 0 AND (s2_mb_2023 > 0 OR s2_lb_2023 > 0)
  AND s1_2024 > 0 AND (s2_mb_2024 > 0 OR s2_lb_2024 > 0); 