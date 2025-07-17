export function getCompanyDescription(
  company: { descriptions?: { language: string; text: string }[] },
  language: string,
): string | null {
  return (
    company.descriptions?.find(
      (d) =>
        d.language.toLowerCase() === language.toLowerCase() && d.text?.trim(),
    )?.text || null
  );
}
