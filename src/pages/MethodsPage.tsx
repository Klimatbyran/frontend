import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";
import { MethodologyNavigation } from "@/components/methods/MethodNavigation";
import { MethodologyContent } from "@/components/methods/MethodContent";
import { MethodologySearch } from "@/components/methods/MethodSearch";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSEO } from "@/components/PageSEO";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/components/LanguageProvider";
import { getMethodById } from "@/lib/methods/methodologyData";

export function MethodsPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMethod, setSelectedMethod] = useState(
    searchParams.get("method") || "parisAgreement"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { isMobile } = useScreenSize();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedMethod]);

  useEffect(() => {
    const method = searchParams.get("method");
    if (method) {
      setSelectedMethod(method);
    }
  }, [searchParams]);

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    setSearchParams({ method });
  };

  // SEO data
  const methodData = getMethodById(selectedMethod);
  const canonicalUrl = `https://klimatkollen.se${currentLanguage === "sv" ? "" : "/en"}/methodology${selectedMethod ? `?method=${selectedMethod}` : ""}`;
  const pageTitle = methodData 
    ? `${t(`methodsPage.${methodData.category}.${selectedMethod}.title`)} - ${t("methodsPage.header.title")} - Klimatkollen`
    : `${t("methodsPage.header.title")} - Klimatkollen`;
  const pageDescription = methodData
    ? t(`methodsPage.${methodData.category}.${selectedMethod}.description`)
    : t("methodsPage.header.description");
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": canonicalUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Klimatkollen",
      "url": "https://klimatkollen.se"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Klimatkollen",
          "item": "https://klimatkollen.se"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": t("methodsPage.header.title"),
          "item": canonicalUrl
        }
      ]
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        document.getElementById("methodology-search")?.focus();
      }, 100);
    }
  };

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        keywords={`klimat, metodologi, ${methodData ? t(`methodsPage.${methodData.category}.${selectedMethod}.title`) : ""}`}
        structuredData={structuredData}
      />
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 text-white">
        <PageHeader
          title={t("methodsPage.header.title")}
          description={t("methodsPage.header.description")}
        ></PageHeader>
        {!isMobile && !showSearch && (
          <button
            onClick={toggleSearch}
            className="p-2 rounded-full bg-black-1 hover:bg-black-2 transition-colors duration-200"
            aria-label="Search methodologies"
          >
            <Search size={20} className="text-white" />
          </button>
        )}
        {!isMobile && showSearch && (
          <div className="mb-8 animate-fadeIn">
            <MethodologySearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectMethod={handleMethodChange}
              onClose={() => setShowSearch(false)}
            />
          </div>
        )}
        <div className="mt-6 relative flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4 mb-6 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <MethodologyNavigation
                selectedMethod={selectedMethod}
                onMethodChange={handleMethodChange}
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
