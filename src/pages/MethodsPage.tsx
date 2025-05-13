import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { MethodologyNavigation } from "@/components/methods/MethodNavigation";
import { MethodologyContent } from "@/components/methods/MethodContent";
import { MethodologySearch } from "@/components/methods/MethodSearch";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSEO } from "@/components/SEO/PageSEO";

export function MethodsPage() {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState("parisAgreement");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedMethod]);

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
        structuredData={structuredData}
      />
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 text-white">
        <PageHeader
          title={t("methodsPage.header.title")}
          description={t("methodsPage.header.description")}
        ></PageHeader>
        {!showSearch && (
          <button
            onClick={toggleSearch}
            className="p-2 rounded-full bg-black-1 hover:bg-black-2 transition-colors duration-200"
            aria-label="Search methodologies"
          >
            <Search size={20} className="text-white" />
          </button>
        )}
        {showSearch && (
          <div className="mb-8 animate-fadeIn">
            <MethodologySearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectMethod={setSelectedMethod}
              onClose={() => setShowSearch(false)}
            />
          </div>
        )}
        <div className="mt-6 relative flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4 mb-6 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <MethodologyNavigation
                selectedMethod={selectedMethod}
                onMethodChange={setSelectedMethod}
              />
            </div>
          </div>
          <main className="lg:w-3/4">
            <MethodologyContent
              method={selectedMethod}
              onNavigate={setSelectedMethod}
            />
          </main>
        </div>
      </div>
    </>
  );
}
