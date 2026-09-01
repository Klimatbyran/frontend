import { Building2, FileText, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RequestAccessModal } from "@/components/products/RequestAccessModal";
import { UnearthCta } from "@/components/products/UnearthCta";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useLanguage } from "@/components/LanguageProvider";

const AVAILABLE_EXTRACTS = [
  {
    key: "companies" as const,
    icon: Building2,
  },
  {
    key: "municipalities" as const,
    icon: MapPin,
  },
  {
    key: "regions" as const,
    icon: FileText,
  },
];

function DataDownloadPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const pageTitle = `${t("dataDownloadPage.title")} - Klimatkollen`;
  const pageDescription = t("dataDownloadPage.description");
  const canonicalUrl = `https://klimatkollen.se/${currentLanguage}/data-download`;

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: t("dataDownloadPage.title"),
          description: pageDescription,
          url: canonicalUrl,
        }}
      />

      <div className="mx-auto max-w-[1200px] px-4 text-white md:px-6">
        <PageHeader
          title={t("dataDownloadPage.title")}
          description={t("dataDownloadPage.description")}
        />

        <section className="mb-16 rounded-level-1 bg-black-2 p-6 md:p-8">
          <h2 className="mb-2 text-xl font-medium text-white">
            {t("dataDownloadPage.freeAccess.title")}
          </h2>
          <p className="mb-4 max-w-3xl text-grey">
            {t("dataDownloadPage.freeAccess.description")}
          </p>
          <ul className="mb-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li className="flex items-center gap-2 text-sm text-grey">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-3" />
              {t("dataDownloadPage.freeAccess.export")}
            </li>
            <li className="flex items-center gap-2 text-sm text-grey">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-3" />
              {t("dataDownloadPage.freeAccess.license")}
            </li>
          </ul>

          <button
            type="button"
            onClick={() => setIsRequestModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-blue-5 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-4"
          >
            {t("dataDownloadPage.freeAccess.requestAccess")}
          </button>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-xl font-medium text-white">
            {t("dataDownloadPage.availableExtracts")}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {AVAILABLE_EXTRACTS.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="rounded-level-1 border border-black-1 bg-black-2 p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-full bg-black-1 p-3">
                    <Icon className="h-5 w-5 text-blue-3" />
                  </div>
                  <h3 className="text-base font-medium text-white">
                    {t(`downloadsPage.${key}`)}
                  </h3>
                </div>
                <p className="text-sm text-grey">
                  {t(`dataDownloadPage.included.${key}.summary`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <UnearthCta />
      </div>

      <RequestAccessModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </>
  );
}

export default DataDownloadPage;
