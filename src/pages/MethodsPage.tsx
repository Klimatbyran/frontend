import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useEffect, useState } from "react";
import MethodsDataSelector from "@/components/methods/MethodsDataSelector";
import { MethodContentCard } from "@/components/methods/MethodContentCard";

export function MethodsPage() {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState("parisAgreement");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <div className="max-w-[1200px] mx-auto">
        <PageHeader
          title={t("methodsPage.header.title")}
          description={t("methodsPage.header.description")}
        />

        <div className="space-y-8">
          <MethodsDataSelector
            selectedMethod={selectedMethod}
            onMethodChange={setSelectedMethod}
          />
          <MethodContentCard method={selectedMethod} />
        </div>
      </div>
    </>
  );
}
