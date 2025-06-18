SELECT
  c."name" AS company_name,
  c."lei",
  ig."subIndustryCode",
  ig."subIndustryName",
  ig."subIndustryDescription",
  ig."sectorCode",
  ig."sectorName",
  ig."groupCode",
  ig."groupName",
  ig."industryCode",
  ig."industryName"
FROM "Company" c
LEFT JOIN "Industry" i ON c."wikidataId" = i."companyWikidataId"
LEFT JOIN "IndustryGics" ig ON i."gicsSubIndustryCode" = ig."subIndustryCode"
ORDER BY c."name"; 