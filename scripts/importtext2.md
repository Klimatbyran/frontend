function checkComparableDataAndCalculatePercentChange() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Rådata');
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  const headers = values[0];
  const rows = values.slice(1);

  const idx = (colName) => headers.indexOf(colName);

  const idx2023scope1 = idx('2023 scope 1 emissions');
  const idx2023scope2 = idx('2023 scope 2 emissions');
  const idx2024scope1 = idx('2024 scope 1 emissions');
  const idx2024scope2 = idx('2024 scope 2 emissions');
  const idx2023totalS3 = idx('2023 total scope 3 emissions');
  const idx2024totalS3 = idx('2024 total scope 3 emissions');

  const scope3CategoryNumbers = Array.from({ length: 16 }, (_, i) => i + 1);
  const idx2023scope3cats = scope3CategoryNumbers.map(n => idx(`2023 scope 3 category ${n}`));
  const idx2024scope3cats = scope3CategoryNumbers.map(n => idx(`2024 scope 3 category ${n}`));

  if (
    [idx2023scope1, idx2023scope2, idx2024scope1, idx2024scope2, idx2023totalS3, idx2024totalS3].includes(-1) ||
    idx2023scope3cats.includes(-1) || idx2024scope3cats.includes(-1)
  ) {
    throw new Error("En eller flera av de obligatoriska kolumnerna saknas.");
  }

  const isValid = (val) => typeof val === 'number' && !isNaN(val) && val !== 0;

  let comparableColIdx = idx('Comparable');
  if (comparableColIdx === -1) {
    comparableColIdx = headers.length;
    sheet.getRange(1, comparableColIdx + 1).setValue('Comparable incl scope 3');
  }


  let changeColIdx = idx('Change in emissions');
  if (changeColIdx === -1) {
    changeColIdx = headers.length + (comparableColIdx === headers.length ? 1 : 0);
    sheet.getRange(1, changeColIdx + 1).setValue('Change in emissions incl. scope 3');
  }

  let changeColIdx2 = idx('Change in emissions scope 1 & 2 only');
  if (changeColIdx2 === -1) {
    changeColIdx2 = changeColIdx + 1; // Right after the first change column
    sheet.getRange(1, changeColIdx2 + 1).setValue('Change in emissions scope 1 & 2 only');
  }

  let comparableScope12Col = idx('Comparable Scope 1 & 2')
   if (comparableScope12Col === -1) {
    comparableScope12Col = changeColIdx+2
    sheet.getRange(1, comparableScope12Col + 1).setValue('Comparable Scope 1 & 2');
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const hasScope1 = isValid(row[idx2023scope1]) && isValid(row[idx2024scope1]);
    const hasScope2 = isValid(row[idx2023scope2]) && isValid(row[idx2024scope2]);

    const hasTotalScope3 = isValid(row[idx2023totalS3]) && isValid(row[idx2024totalS3]);

    const hasScope3Cat2023 = idx2023scope3cats.some(j => isValid(row[j]));
    const hasScope3Cat2024 = idx2024scope3cats.some(j => isValid(row[j]));
    const hasCommonScope3Cats = hasScope3Cat2023 && hasScope3Cat2024;

    const comparable = hasScope1 && hasScope2 && (hasTotalScope3 || hasCommonScope3Cats);
    sheet.getRange(i + 2, comparableColIdx + 1).setValue(comparable);

    const comparableInScope1And2 = hasScope1 && hasScope2;
    sheet.getRange(i + 2, comparableScope12Col + 1).setValue(comparableInScope1And2);

    if(comparableInScope1And2){
      total2023 = row[idx2023scope1] + row[idx2023scope2]
      total2024 = row[idx2024scope1] + row[idx2024scope2]

            // Beräkna procentuell förändring
      const changePct = total2023 !== 0 ? ((total2024 - total2023) / total2023) * 100 : '';
      sheet.getRange(i + 2, changeColIdx2 + 1).setValue(changePct);

    }

    if (comparable) {
      let total2023 = 0;
      let total2024 = 0;
      let hasValidScope3Categories = false;

      // Lägg till endast jämförbara scope 3-kategorier
      for (let j = 0; j < scope3CategoryNumbers.length; j++) {
        const val2023 = row[idx2023scope3cats[j]];
        const val2024 = row[idx2024scope3cats[j]];
        if (isValid(val2023) && isValid(val2024)) {
          total2023 += val2023;
          total2024 += val2024;
          hasValidScope3Categories = true;
        }
      }

      // Om inga giltiga scope 3-kategorier, använd total scope 3
      if (!hasValidScope3Categories && isValid(row[idx2023totalS3]) && isValid(row[idx2024totalS3])) {
        total2023 += row[idx2023totalS3];
        total2024 += row[idx2024totalS3];
      }

      // Lägg till scope 1 + 2
      total2023 += row[idx2023scope1] + row[idx2023scope2];
      total2024 += row[idx2024scope1] + row[idx2024scope2];

      // Beräkna procentuell förändring
      const changePct = total2023 !== 0 ? ((total2024 - total2023) / total2023) * 100 : '';
      sheet.getRange(i + 2, changeColIdx + 1).setValue(changePct);
    } else {
      sheet.getRange(i + 2, changeColIdx + 1).setValue('');
    }
  }
}
