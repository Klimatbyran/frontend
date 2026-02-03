import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MethodologyNavigation } from "@/components/methods/MethodNavigation";
import { MethodologyContent } from "@/components/methods/MethodContent";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSEO } from "@/components/SEO/PageSEO";
import { getAllMethods } from "@/lib/methods/methodologyData";

export function MethodsPage() {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedMethod]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams) {
      const searchQuery = searchParams.get("view") || "";

      const matchingMethod = matchMethodWithSearchQuery(searchQuery);
      if (matchingMethod) {
        setSelectedMethod(matchingMethod);
      }
    }
  }, [location.search]);

  const matchMethodWithSearchQuery = (searchQuery: string) => {
    const allMethods = getAllMethods();
    const validMethodIds = allMethods.map((method) => method.id);

    if (validMethodIds.includes(searchQuery)) {
      return searchQuery;
    }

    // fallbacks for old category mappings (for backward compatibility)
    if (searchQuery === "company") {
      return "companyDataOverview";
    } else if (searchQuery === "municipality") {
      return "municipalityDataOverview";
    } else {
      return "parisAgreement";
    }

    // Default fallback
    return "parisAgreement";
  };

  // Prepare SEO data
  const canonicalUrl = "https://klimatkollen.se/methodology";
  const pageTitle = `${t("methodsPage.header.title")} - Klimatkollen`;
  const pageDescription = t("methodsPage.header.description");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("methodsPage.header.title"),
    description: pageDescription,
    url: canonicalUrl,
  };

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 text-white">
        <PageHeader
          title={t("methodsPage.header.title")}
          description={t("methodsPage.header.description")}
        ></PageHeader>
        <div className="mt-6 relative flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4 mb-6 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <MethodologyNavigation
                selectedMethod={selectedMethod}
                onMethodChange={setSelectedMethod}
                contentRef={contentRef}
              />
            </div>
          </div>
          <main className="lg:w-3/4">
            <MethodologyContent ref={contentRef} method={selectedMethod} />
          </main>
        </div>
      </div>
    </>
  );
}
