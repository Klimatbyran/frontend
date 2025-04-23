import { PageHeader } from "@/components/layout/PageHeader";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface ContentItem {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category?: string;
  date?: string;
  readTime?: string;
  link?: string;
}

interface ContentGridPageProps {
  title: string;
  description: string;
  canonicalUrl: string;
  items: ContentItem[];
  renderCard: (item: ContentItem) => React.ReactNode;
  structuredData?: any;
}

export function ContentGridPage({
  title,
  description,
  canonicalUrl,
  items,
  renderCard,
  structuredData,
}: ContentGridPageProps) {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pageTitle = `${title} - Klimatkollen`;

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={description}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
      <div className="w-full max-w-[1200px] mx-auto space-y-8">
        <PageHeader title={title} description={description} />
        <div className="max-w-[1150px] mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((item) => renderCard(item))}
          </div>
        </div>
      </div>
    </>
  );
}
