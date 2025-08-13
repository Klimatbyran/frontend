import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";
import { MethodologyNavigation } from "@/components/methods/MethodNavigation";
import { MethodologyContent } from "@/components/methods/MethodContent";
import { MethodologySearch } from "@/components/methods/MethodSearch";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useConfig } from "vike-react/useConfig";
import { useScreenSize } from "@/hooks/useScreenSize";

export function MethodsPage() {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState("parisAgreement");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { isMobile } = useScreenSize();
  const contentRef = useRef<HTMLDivElement>(null);
  const config = useConfig();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedMethod]);

  useEffect(() => {
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

    config({
      title: pageTitle,
      description: pageDescription,
      Head: () => (
        <>
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content="/images/social-picture.png" />
          <link rel="canonical" href={canonicalUrl} />
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </>
      ),
    });
  }, [t, config]);

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
                contentRef={contentRef}
              />
            </div>
          </div>
          <main className="lg:w-3/4">
            <MethodologyContent
              ref={contentRef}
              method={selectedMethod}
              onNavigate={setSelectedMethod}
            />
          </main>
        </div>
      </div>
    </>
  );
}
