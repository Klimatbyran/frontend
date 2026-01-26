import { useParams, Link, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import { CalendarDays, Clock, ArrowLeft, Share2, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useScreenSize } from "@/hooks/useScreenSize";
import { localizeUnit } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { useBlogPost, getBlogPost } from "@/hooks/useBlogPosts";
import { blogMetadataByLanguage } from "@/lib/blog/blogPostsList";
import { LocalizedLink } from "@/components/LocalizedLink";
import { Seo } from "@/components/SEO/Seo";
import { getArticleOgImageUrl, getDefaultOgImageUrl } from "@/utils/seo/ogImages";
import { generateArticleStructuredData } from "@/utils/seo/contentSeo";
import { buildAbsoluteUrl } from "@/utils/seo";

export function BlogDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { blogPost, loading, error } = useBlogPost(id!);
  const [copied, setCopied] = useState(false);
  const { isMobile } = useScreenSize();
  const { currentLanguage } = useLanguage();

  // Generate SEO meta with preview support
  const seoMeta = useMemo(() => {
    if (!blogPost) {
      return {
        title: "Klimatkollen",
        description: "Open climate data for citizens",
        og: {
          image: getDefaultOgImageUrl(),
        },
      };
    }

    const { metadata } = blogPost;
    const canonical = location.pathname;
    
    // Use API endpoint for preview generation (with fallback to static image)
    // API generates preview with title + excerpt, static image is just the image
    const ogImage = getArticleOgImageUrl(id || "", metadata.image);

    // Generate Article structured data
    const canonicalUrl = buildAbsoluteUrl(canonical);
    const structuredData = generateArticleStructuredData(
      metadata,
      canonicalUrl,
      ogImage,
    );

    return {
      title: `${metadata.title} - Klimatkollen`,
      description: metadata.excerpt || "",
      canonical,
      og: {
        title: metadata.title,
        description: metadata.excerpt || "",
        image: ogImage,
        type: "article",
      },
      twitter: {
        card: "summary_large_image" as const,
        title: metadata.title,
        description: metadata.excerpt || "",
      },
      structuredData,
    };
  }, [blogPost, location.pathname, id]);

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: blogPost?.metadata.title,
          text: t("blogDetailPage.shareText"),
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  if (loading) return <div>{t("blogDetailPage.loading")}</div>;
  if (error) return <div>{t("blogDetailPage.postNotFound")}</div>;
  if (!blogPost) return <div>{t("blogDetailPage.postNotFound")}</div>;

  const relatedPosts = blogPost.metadata.relatedPosts
    ? blogPost.metadata.relatedPosts
        .map((relatedId) => {
          const metadata = blogMetadataByLanguage[currentLanguage].find(
            (m) => m.id === relatedId,
          );
          return (
            getBlogPost(metadata, currentLanguage).blogPost?.metadata ?? null
          );
        })
        .filter(Boolean)
    : [];

  return (
    <>
      {blogPost && <Seo meta={seoMeta} />}
      <div
        className={`max-w-[1200px] mx-auto ${
          isMobile ? "space-y-8" : "space-y-16"
        } px-4`}
      >
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <LocalizedLink to="/articles">
            <ArrowLeft className="w-4 h-4" />
            {t("blogDetailPage.back")}
          </LocalizedLink>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={handleShare}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          {copied ? t("blogDetailPage.linkCopied") : t("blogDetailPage.share")}
        </Button>
      </div>

      {/* Hero Section */}
      <div className={`space-y-${isMobile ? "4" : "8"}`}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="px-3 py-1 bg-blue-5/50 rounded-full text-blue-2 text-sm">
            {t("insightCategories." + blogPost.metadata.category)}
          </span>
          <div className="flex items-center gap-2 text-grey text-sm">
            <CalendarDays className="w-4 h-4" />
            <span>
              {localizeUnit(new Date(blogPost.metadata.date), currentLanguage)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-grey text-sm">
            <Clock className="w-4 h-4" />
            <span>{blogPost.metadata.readTime}</span>
          </div>
        </div>

        <Text
          variant={isMobile ? "h1" : "display"}
          className={isMobile ? "text-3xl" : ""}
        >
          {blogPost.metadata.title}
        </Text>

        <Text variant="body" className="text-grey max-w-3xl">
          {blogPost.metadata.excerpt}
        </Text>
      </div>

      {/* Featured Image */}
      <div
        className={`relative ${
          isMobile ? "h-[250px]" : "h-[500px]"
        } rounded-level-1 overflow-hidden`}
      >
        <img
          src={blogPost.metadata.image}
          alt={blogPost.metadata.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Author Section */}
      {blogPost.metadata.author && (
        <div className="flex items-center gap-4 p-8 bg-black-2 rounded-level-2">
          <img
            src={blogPost.metadata.author.avatar}
            alt={blogPost.metadata.author.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <Text variant="body">{blogPost.metadata.author.name}</Text>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={{
            img: ({ node, ...props }) => (
              <img
                {...props}
                className="w-2/3 mx-auto shadow-lg !rounded-lg !overflow-hidden"
              />
            ),
            a: ({ node, ...props }) => (
              <a
                {...props}
                target="_blank" // Opens link in a new tab
                rel="noopener noreferrer"
                className="underline hover:text-white"
              />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-8">
                <table {...props} className="w-full overflow-hidden" />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead {...props} className="bg-blue-5/20" />
            ),
            th: ({ node, ...props }) => (
              <th
                {...props}
                className="border border-blue-2/50 px-4 py-3 text-left font-semibold text-blue-2"
              />
            ),
            td: ({ node, ...props }) => (
              <td {...props} className="border border-slate-500/50 px-4 py-3" />
            ),
          }}
        >
          {blogPost.content}
        </ReactMarkdown>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="space-y-8">
          <Text variant="h3">{t("blogDetailPage.relatedArticles")}</Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedPosts.map(
              (post) =>
                post && (
                  <Link
                    key={post.id}
                    to={`/insights/${post.id}`}
                    className="group bg-black-2 rounded-level-2 overflow-hidden transition-transform hover:scale-[1.02]"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-8 space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-blue-5/50 rounded-full text-blue-2 text-sm">
                          {post.category}
                        </span>
                        <div className="flex items-center gap-2 text-grey text-sm">
                          <CalendarDays className="w-4 h-4" />
                          <span>
                            {new Date(post.date).toLocaleDateString("sv-SE")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-grey text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <Text
                        variant="h4"
                        className="group-hover:text-blue-2 transition-colors"
                      >
                        {post.title}
                      </Text>
                      <Text className="text-grey">{post.excerpt}</Text>
                    </div>
                  </Link>
                ),
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
