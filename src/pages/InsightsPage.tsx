import { CalendarDays, Clock, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Text } from "@/components/ui/text";
import { blogMetadata } from "../lib/blog/blogPostsList";
import { isMobile } from "react-device-detect";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { ContentGridPage } from "@/components/layout/ContentGridPage";
import { ContentCard } from "@/components/layout/ContentCard";

// Component for blog metadata (category, date, read time)
function BlogMeta({
  category,
  date,
  readTime,
}: {
  category: string;
  date: string;
  readTime: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span
        aria-label="Category"
        className="px-3 py-1 bg-blue-5/50 rounded-full text-blue-2 text-sm"
      >
        {category}
      </span>
      <div className="flex items-center gap-2 text-grey text-sm">
        <CalendarDays className="w-4 h-4" />
        <span aria-label="Date Published">
          {new Date(date).toLocaleDateString("sv-SE")}
        </span>
      </div>
      <div className="flex items-center gap-2 text-grey text-sm">
        <Clock className="w-4 h-4" />
        <span aria-label="Read Time">{readTime}</span>
      </div>
    </div>
  );
}

// Component for blog post cards
function BlogCard({ post }: { post: (typeof blogMetadata)[number] }) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  return (
    <Link
      to={`/${currentLanguage}/insights/${post.id}`}
      className="group bg-black-2 rounded-level-2 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]"
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-8 space-y-4">
        <BlogMeta
          category={post.category}
          date={post.date}
          readTime={post.readTime}
        />
        <Text
          variant="h4"
          className="group-hover:text-blue-2 transition-colors"
        >
          {post.title}
        </Text>
        <Text className="text-grey">{post.excerpt}</Text>
        <div className="flex items-center gap-2 text-blue-2 group-hover:gap-3 transition-all">
          <span aria-label="Click to read full article">
            {t("insightsPage.readMore")}
          </span>
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

export function InsightsPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const featuredPost = isMobile ? undefined : blogMetadata[0];
  const otherPosts = isMobile ? blogMetadata.slice(0) : blogMetadata.slice(1);

  const canonicalUrl = "https://klimatkollen.se/insights/articles";
  const pageTitle = t("insightsPage.title");
  const pageDescription = t("insightsPage.description");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
  };

  const items = otherPosts.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    image: post.image || "/images/default-blog-image.jpg",
    category: post.category,
    date: post.date,
    readTime: post.readTime,
  }));

  return (
    <>
      {featuredPost && (
        <div className="relative rounded-level-1">
          <Link
            to={`/${currentLanguage}/insights/${featuredPost.id}`}
            className="group block transition-all duration-300"
          >
            <div className="absolute inset-0 rounded-level-1 shadow-[0_0_40px_rgba(153,207,255,0.15)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="relative h-[500px] overflow-hidden rounded-level-1">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-16 space-y-4">
                <div className="flex items-center gap-4">
                  <span
                    aria-label="Category"
                    className="px-3 py-1 bg-blue-5/50 rounded-full text-blue-2 text-sm"
                  >
                    {featuredPost.category}
                  </span>
                  <div className="flex items-center gap-2 text-grey text-sm">
                    <CalendarDays className="w-4 h-4" />
                    <span aria-label="Date Published">
                      {new Date(featuredPost.date).toLocaleDateString("sv-SE")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-grey text-sm">
                    <Clock className="w-4 h-4" />
                    <span aria-label="Read Time">{featuredPost.readTime}</span>
                  </div>
                </div>
                <Text
                  variant="h2"
                  className="group-hover:text-blue-2 transition-colors"
                >
                  {featuredPost.title}
                </Text>
                <Text className="text-grey max-w-2xl">
                  {featuredPost.excerpt}
                </Text>
              </div>
            </div>
          </Link>
        </div>
      )}
      <ContentGridPage
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        items={items}
        renderCard={(item) => <ContentCard item={item} basePath="insights" />}
        structuredData={structuredData}
      />
    </>
  );
}
