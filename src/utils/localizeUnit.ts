export const localizeUnit = (unit: number | Date, currentLanguage: string) => {
    
    const formatNumber = (num: number) => num.toLocaleString(
      currentLanguage === 'sv' 
      ? 'sv-SE' 
      : 'en-US',
      { minimumFractionDigits: 1, maximumFractionDigits: 1 }
    );
  
    if (typeof unit === 'number') {
      return formatNumber(unit);
    }

    if (unit instanceof Date) {
      return new Intl.DateTimeFormat(
        currentLanguage === 'sv' ? 'sv-SE' : 'en-US',
        { dateStyle: 'short' }
      ).format(unit);
    }
  }
  