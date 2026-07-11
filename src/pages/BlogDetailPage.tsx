import { useParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Share2, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useLanguage } from "@/components/LanguageProvider";
import { useBlogPost, getBlogPost } from "@/hooks/useBlogPosts";
import { blogMetadataByLanguage } from "@/lib/blog/blogPostsList";
import { LocalizedLink } from "@/components/LocalizedLink";
import { PageSEO } from "@/components/SEO/PageSEO";
import { buildAbsoluteUrl } from "@/utils/seo";
import {
  BlogHeroSection,
  BlogRelatedPosts,
  blogMarkdownComponents,
  buildArticleStructuredData,
} from "./BlogDetailPageParts";

async function shareBlogPost({
  title,
  shareText,
  onCopied,
}: {
  title?: string;
  shareText: string;
  onCopied: () => void;
}) {
  const shareUrl = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: shareText,
        url: shareUrl,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    onCopied();
  } catch (error) {
    console.error("Error copying to clipboard:", error);
  }
}

function getRelatedPosts(
  relatedPostIds: string[] | undefined,
  currentLanguage: string,
) {
  if (!relatedPostIds) {
    return [];
  }

  return relatedPostIds
    .map((relatedId) => {
      const metadata = blogMetadataByLanguage[currentLanguage].find(
        (item) => item.id === relatedId,
      );
      return getBlogPost(metadata, currentLanguage).blogPost?.metadata ?? null;
    })
    .filter(Boolean);
}

export function BlogDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { blogPost, blogPostsLoading, blogPostsError } = useBlogPost(id!);
  const [copied, setCopied] = useState(false);
  const { isMobile } = useScreenSize();
  const { currentLanguage } = useLanguage();

  const handleShare = () => {
    void shareBlogPost({
      title: blogPost?.metadata.title,
      shareText: t("blogDetailPage.shareText"),
      onCopied: () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
    });
  };

  if (blogPostsLoading) return <div>{t("blogDetailPage.loading")}</div>;
  if (blogPostsError) return <div>{t("blogDetailPage.postNotFound")}</div>;
  if (!blogPost) return <div>{t("blogDetailPage.postNotFound")}</div>;

  const postCanonicalUrl = buildAbsoluteUrl(
    `/${currentLanguage}/insights/${id}`,
  );
  const relatedPosts = getRelatedPosts(
    blogPost.metadata.relatedPosts,
    currentLanguage,
  );

  return (
    <div
      className={`max-w-[1200px] mx-auto ${
        isMobile ? "space-y-8" : "space-y-16"
      } px-4`}
    >
      <PageSEO
        title={`${blogPost.metadata.title} - Klimatkollen`}
        description={blogPost.metadata.excerpt}
        canonicalUrl={postCanonicalUrl}
        ogType="article"
        ogImage={blogPost.metadata.image}
        ogImageAlt={blogPost.metadata.title}
        structuredData={buildArticleStructuredData({
          blogPost,
          postCanonicalUrl,
        })}
      />

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

      <BlogHeroSection
        blogPost={blogPost}
        isMobile={isMobile}
        currentLanguage={currentLanguage}
        categoryLabel={t("insightCategories." + blogPost.metadata.category)}
      />

      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={blogMarkdownComponents}
        >
          {blogPost.content}
        </ReactMarkdown>
      </div>

      <BlogRelatedPosts
        relatedPosts={relatedPosts}
        title={t("blogDetailPage.relatedArticles")}
      />
    </div>
  );
}
