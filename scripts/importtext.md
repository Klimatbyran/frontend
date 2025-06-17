function importCompanyEmissions() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Rådata') ||
                SpreadsheetApp.getActiveSpreadsheet().insertSheet('Rådata')
  sheet.clear()

  const response = UrlFetchApp.fetch('https://api.klimatkollen.se/api/companies')
  const companies = JSON.parse(response.getContentText())

  const scope3Categories = Array.from({ length: 16 }, (_, i) => i + 1)

  const headers = [
    'Name', 'Wikidata ID', 'Industry',
    '2024 total emissions', '2023 total emissions',
    '2024 scope 1 emissions', '2023 scope 1 emissions',
    '2024 scope 2 emissions', '2023 scope 2 emissions',
    '2024 total scope 3 emissions', '2023 total scope 3 emissions',
    ...scope3Categories.map(n => `2024 scope 3 category ${n}`),
    ...scope3Categories.map(n => `2023 scope 3 category ${n}`),
    'Tags'
  ]

  sheet.appendRow(headers)

  companies.forEach(company => {
    const row = []

    const name = company.name || ''
    const wikidataId = company.wikidataId || ''
    const industry = company.industry?.industryGics?.subIndustryCode || ''
    const tags = company.tags?.join(', ') || ''

    row.push(name, wikidataId, industry)

    const periods = company.reportingPeriods || []

    const findPeriod = (targetYear) => {
      return periods.find(p => {
        const startYear = new Date(p.startDate).getFullYear()
        const endYear = new Date(p.endDate).getFullYear()
        return endYear === targetYear && (startYear === targetYear || startYear === targetYear - 1)
      })
    }

    const period2024 = findPeriod(2024)
    const period2023 = findPeriod(2023)

    const getValue = (obj, key) => obj?.[key] ?? ''

    const emissions2024 = period2024?.emissions
    const emissions2023 = period2023?.emissions

    const getTotalEmissions = (em) => {
      if (em?.calculatedTotalEmissions != null) return em.calculatedTotalEmissions
      if (em?.statedTotalEmissions?.total != null) return em.statedTotalEmissions.total
      return ''
    }

    row.push(
      getTotalEmissions(emissions2024),
      getTotalEmissions(emissions2023),

      getValue(emissions2024, 'scope1')?.total ?? '',
      getValue(emissions2023, 'scope1')?.total ?? '',

      getValue(emissions2024, 'scope2')?.mb ?? getValue(emissions2024, 'scope2')?.lb ?? getValue(emissions2024, 'scope2')?.calculatedTotalEmissions ?? '',
      getValue(emissions2023, 'scope2')?.mb ?? getValue(emissions2023, 'scope2')?.lb ?? getValue(emissions2023, 'scope2')?.calculatedTotalEmissions ?? '',

      emissions2024?.scope3?.calculatedTotalEmissions ?? '',
      emissions2023?.scope3?.calculatedTotalEmissions ?? ''
    )

    const getCategoriesMap = (em) => {
      const map = {}
      em?.scope3?.categories?.forEach((cat) => {
        map[cat.category] = cat.total
      })
      return map
    }

    const cat2024 = getCategoriesMap(emissions2024)
    const cat2023 = getCategoriesMap(emissions2023)

    scope3Categories.forEach(n => row.push(cat2024[n] ?? ''))
    scope3Categories.forEach(n => row.push(cat2023[n] ?? ''))

    row.push(tags)

    sheet.appendRow(row)
  })

  sheet.setFrozenRows(1)
}
