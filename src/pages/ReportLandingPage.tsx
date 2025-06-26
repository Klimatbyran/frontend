import { useParams } from "react-router-dom";
import { reports } from "@/lib/constants/reports";
import { PageSEO } from "@/components/SEO/PageSEO";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ReportLandingPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const { t } = useTranslation();
  // Find the report by matching the PDF filename (without extension)
  const report = reports.find((r) => {
    if (!r.pdfUrl) return false;
    // Extract the filename without extension from the pdfUrl
    const pdfFile = r.pdfUrl
      .split("/")
      .pop()
      ?.replace(/\.pdf$/, "");
    return pdfFile === reportId;
  });

  const image = report?.coverImage || "/images/social-picture.png";
  const title = report?.title || "Klimatkollen Rapport";
  const description = report?.excerpt || "Läs rapporten från Klimatkollen.";
  const pdfUrl = report?.pdfUrl || `/reports/${reportId}.pdf`;
  const canonicalUrl = `https://klimatkollen.se/reports/${reportId}`;

  return (
    <>
      <PageSEO
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
        ogType="article"
        ogImage={image}
      />
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
                className="group overflow-hidden hover:text-white inline-flex items-center gap-2 px-6 py-3 mt-4 text-blue-2 text-lg font-medium"
                style={{ textDecoration: "none" }}
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
