import { useParams, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { reports } from "@/lib/constants/reports";
import { Seo } from "@/components/SEO/Seo";
import { getReportOgImageUrl } from "@/utils/seo/ogImages";
import { generateReportStructuredData } from "@/utils/seo/contentSeo";
import { buildAbsoluteUrl, buildAbsoluteImageUrl } from "@/utils/seo";

export function ReportLandingPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const { t } = useTranslation();
  // Find the report by matching the PDF filename (without extension)
  const report = reports.find((r) => {
    if (!r.link) {
      return false;
    }
    // Extract the filename without extension from the link
    const pdfFile = r.link
      .split("/")
      .pop()
      ?.replace(/\.pdf$/, "");
    return pdfFile === reportId;
  });

  const location = useLocation();
  const image = report?.image || "/images/social-picture.png";
  const title = report?.title || "Klimatkollen Rapport";
  const description = report?.excerpt || "Läs rapporten från Klimatkollen.";
  const pdfUrl = report?.link || `/reports/${reportId}.pdf`;

  // Generate SEO meta with preview support
  const seoMeta = useMemo(() => {
    const canonical = location.pathname;
    
    // Use API endpoint for preview generation (with fallback to static image)
    // API generates preview with title + excerpt, static image is just the image
    const ogImage = getReportOgImageUrl(reportId || "", image);

    // Generate Report structured data
    const canonicalUrl = buildAbsoluteUrl(canonical);
    const absolutePdfUrl = pdfUrl.startsWith("http") ? pdfUrl : buildAbsoluteUrl(pdfUrl);
    const absoluteImageUrl = buildAbsoluteImageUrl(image);
    const structuredData = generateReportStructuredData(
      title,
      description,
      canonicalUrl,
      absolutePdfUrl,
      absoluteImageUrl,
    );

    return {
      title: `${title} - Klimatkollen`,
      description,
      canonical,
      og: {
        title,
        description,
        image: ogImage,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      structuredData,
    };
  }, [title, description, image, location.pathname, reportId, pdfUrl]);

  return (
    <>
      {report && <Seo meta={seoMeta} />}
      <div className="flex justify-center mt-12">
        <div className="group bg-black-2 rounded-level-2 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a] max-w-md w-full">
          <div className="relative h-36 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-8 space-y-4">
            <h1 className="text-2xl font-semibold transition-colors">
              {title}
            </h1>
            {report?.excerpt && <p className="text-grey">{report.excerpt}</p>}
            <div className="flex justify-center">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden hover:text-white inline-flex items-center gap-2 px-6 py-3 mt-4 text-blue-2 text-lg font-medium no-underline"
              >
                {t("reportsPage.openReport")}
                <ArrowUpRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
