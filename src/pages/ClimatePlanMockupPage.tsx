import { PageSEO } from "@/components/SEO/PageSEO";
import { ClimatePlanMockupView } from "@/components/climate-plan/ClimatePlanMockupView";

const PAGE_TITLE = "Klimatplan";
const PAGE_DESCRIPTION =
  "En lokal klimatplan är kommunens styrdokument för att minska utsläppen, klimatanpassa samhället och säkra ett gott liv för invånarna. Frågorna fylls i ett steg i taget. Siffror som Klimatkollen redan har visas färdiga.";

export function ClimatePlanMockupPage() {
  return (
    <>
      <PageSEO
        title={`${PAGE_TITLE} - Klimatkollen`}
        description={PAGE_DESCRIPTION}
        canonicalUrl="https://klimatkollen.se/climate-plan"
        noindex
      />
      <ClimatePlanMockupView />
    </>
  );
}
