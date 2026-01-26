import {
  Database,
  Lock,
  Mail,
  Server,
  FileText,
  Building2,
  MapPin,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductCard } from "@/components/products/ProductCard";
import { RequestAccessModal } from "@/components/products/RequestAccessModal";
import { Seo } from "@/components/SEO/Seo";
import { buildAbsoluteUrl } from "@/utils/seo";

interface DataCategoryProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isFirst?: boolean;
  isLast?: boolean;
}

const DataCategory = ({
  icon,
  title,
  description,
  isFirst = false,
  isLast = false,
}: DataCategoryProps) => (
  <div
    className={`bg-black-2 p-6 border border-black-2 hover:border-black-1 transition-colors ${
      isFirst
        ? "first:rounded-t-lg last:rounded-b-lg md:first:rounded-l-lg md:first:rounded-tr-none md:last:rounded-r-lg md:last:rounded-bl-none"
        : ""
    } ${
      isLast
        ? "first:rounded-t-lg last:rounded-b-lg md:first:rounded-l-lg md:first:rounded-tr-none md:last:rounded-r-lg md:last:rounded-bl-none"
        : ""
    }`}
  >
    <div className="flex items-center gap-3 mb-3 text-white">
      {icon}
      <h3 className="text-lg font-light">{title}</h3>
    </div>
    <p className="text-grey">{description}</p>
  </div>
);

function ProductsPage() {
  const { t } = useTranslation();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const apiFeatures = [
    {
      icon: <Server className="h-5 w-5 text-green-4" />,
      text: t("productsPage.apiAccess.realtime"),
    },
    {
      icon: <FileText className="h-5 w-5 text-green-4" />,
      text: t("productsPage.apiAccess.documentation"),
    },
    // {
    //   icon: <Lock className="h-5 w-5 text-green-4" />,
    //   text: t("productsPage.apiAccess.secure"),
    // },
    {
      icon: <Mail className="h-5 w-5 text-green-4" />,
      text: t("productsPage.apiAccess.support"),
    },
  ];

  const freeFeatures = [
    {
      icon: <Server className="h-5 w-5 text-blue-4" />,
      text: t("productsPage.freeAccess.export"),
    },
    {
      icon: <Building2 className="h-5 w-5 text-blue-4" />,
      text: t("productsPage.freeAccess.data"),
    },
    {
      icon: <Lock className="h-5 w-5 text-blue-4" />,
      text: t("productsPage.freeAccess.license"),
    },
  ];

  const apiActions = (
    <>
      <a
        href="mailto:hej@klimatkollen.se?subject=API%20Access%20Pricing%20Request&body=Hi%2C%0A%0AI'm%20interested%20in%20learning%20more%20about%20the%20API%20direct%20access%20pricing.%0A%0ABest%20regards"
        className="inline-flex items-center justify-center rounded-md bg-green-4 px-6 py-3 text-base font-medium text-white shadow-lg hover:bg-green-3 w-full transition-all"
      >
        {t("productsPage.apiAccess.contactPricing")}
      </a>
      <a
        href="https://api.klimatkollen.se/api/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-md bg-green-4 px-6 py-3 text-base font-medium text-white shadow-lg hover:bg-green-3 w-full transition-all border border-green-4"
      >
        {t("productsPage.apiAccess.viewDocs")}
      </a>
    </>
  );

  const freeActions = (
    <>
      <button
        onClick={() => setIsRequestModalOpen(true)}
        className="inline-flex items-center justify-center rounded-md bg-blue-4 px-6 py-3 text-base font-medium text-white shadow-lg hover:bg-blue-3 w-full transition-all"
      >
        {t("productsPage.freeAccess.requestAccess")}
      </button>
      <RequestAccessModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </>
  );

  // Prepare SEO data
  const pageTitle = `${t("productsPage.title")} - Klimatkollen`;
  const pageDescription = t("productsPage.description");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("productsPage.title"),
    description: pageDescription,
    url: buildAbsoluteUrl("/products"),
  };

  const seoMeta = {
    title: pageTitle,
    description: pageDescription,
    canonical: "/products",
    og: {
      title: pageTitle,
      description: pageDescription,
      type: "website",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: pageTitle,
      description: pageDescription,
    },
    structuredData,
  };

  return (
    <>
      <Seo meta={seoMeta} />

      <div className="max-w-[1200px] mx-auto">
        <PageHeader
          title={t("productsPage.title")}
          description={t("productsPage.description")}
        />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Premium Version */}
            <ProductCard
              title={t("productsPage.apiAccess.title")}
              description={t("productsPage.apiAccess.description")}
              icon={<Server className="h-6 w-6 text-green-5" />}
              features={apiFeatures}
              actions={apiActions}
              bgColor="bg-green-1"
              borderColor="border-green-4"
              hoverBorderColor="border-green-5"
              textColor="text-green-5"
              iconBgColor="bg-green-2"
            />

            {/* Free Version */}
            <ProductCard
              title={t("productsPage.freeAccess.title")}
              description={t("productsPage.freeAccess.description")}
              icon={<Database className="h-6 w-6 text-blue-5" />}
              features={freeFeatures}
              actions={freeActions}
              bgColor="bg-blue-1"
              borderColor="border-blue-4"
              hoverBorderColor="border-blue-5"
              textColor="text-blue-5"
              iconBgColor="bg-blue-2"
            />
          </div>

          {/* Data Overview Section */}
          <div className="mx-auto max-w-7xl mt-16 mb-16">
            <h2 className="text-2xl font-light text-white text-center mb-8">
              {t("productsPage.dataOverview.title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              <DataCategory
                icon={<Building2 className="h-5 w-5 text-grey" />}
                title={t("productsPage.dataOverview.corporate.title")}
                description={t(
                  "productsPage.dataOverview.corporate.description",
                )}
                isFirst
              />
              <DataCategory
                icon={<FileText className="h-5 w-5 text-grey" />}
                title={t("productsPage.dataOverview.reports.title")}
                description={t("productsPage.dataOverview.reports.description")}
              />
              <DataCategory
                icon={<MapPin className="h-5 w-5 text-grey" />}
                title={t("productsPage.dataOverview.municipality.title")}
                description={t(
                  "productsPage.dataOverview.municipality.description",
                )}
                isLast
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductsPage;
