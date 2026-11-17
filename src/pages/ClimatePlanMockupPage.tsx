import { PageHeader } from "@/components/layout/PageHeader";
import { PageSEO } from "@/components/SEO/PageSEO";
import { ClimatePlanMockupView } from "@/components/climate-plan/ClimatePlanMockupView";

const PAGE_TITLE = "Klimatplan";
const PAGE_DESCRIPTION =
  "En lokal klimatplan är kommunens styrdokument för att minska utsläppen, klimatanpassa samhället och säkra ett gott liv för invånarna. Här fylls inriktning, genomförande, uppföljning och kommunikation i. Siffror som Klimatkollen redan har visas färdiga.";

export function ClimatePlanMockupPage() {
  return (
    <>
      <PageSEO
        title={`${PAGE_TITLE} - Klimatkollen`}
        description={PAGE_DESCRIPTION}
        canonicalUrl="https://klimatkollen.se/climate-plan"
        noindex
      />
      <div className="mx-auto max-w-[1200px] text-white">
        <PageHeader
          className="mx-0 mb-8 max-w-none p-0 md:mb-12"
          title={PAGE_TITLE}
          description={PAGE_DESCRIPTION}
        />
        <ClimatePlanMockupView />
      </div>
    </>
  );
}
