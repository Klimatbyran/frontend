import { ContentMeta } from "@/types/content";

export function getReportPdfLink(
  report: ContentMeta,
  language: "en" | "sv",
): string {
  if (language === "en" && report.linkEn) return report.linkEn;
  return report.link ?? "";
}

export function getReportTitle(
  report: ContentMeta,
  language: "en" | "sv",
): string {
  if (language === "en" && report.titleEn) return report.titleEn;
  return report.title;
}

export function getReportExcerpt(
  report: ContentMeta,
  language: "en" | "sv",
): string {
  if (language === "en" && report.excerptEn) return report.excerptEn;
  return report.excerpt;
}

function pdfBasename(link?: string): string | undefined {
  return link
    ?.split("/")
    .pop()
    ?.replace(/\.pdf$/, "");
}

/** Resolve a report from a route segment, PDF basename, slug, or legacy landing path. */
export function findReportByReportId(
  reportId: string | undefined,
): ContentMeta | undefined {
  if (!reportId) return undefined;

  return reports.find((report) => {
    if (report.id === reportId || report.slug === reportId) return true;

    const basenames = [
      pdfBasename(report.link),
      pdfBasename(report.linkEn),
    ].filter((basename): basename is string => Boolean(basename));
    if (basenames.includes(reportId)) return true;

    if (report.legacyReportIds?.includes(reportId)) return true;

    return false;
  });
}

export const reports: ContentMeta[] = [
  {
    id: "1",
    title: "Storföretagens historiska utsläpp",
    slug: "storföretagens-historiska-utsläpp",
    date: "2025-03-11",
    excerpt: "En analys av 150 bolags klimatredovisningar",
    readTime: "15 min",
    category: "report",
    author: {
      name: "Alexandra Palmquist",
      avatar: "/people/alex.jpg",
    },
    link: "/reports/2025-03-17_StorfoeretagensHistoriskaUtslaepp.pdf",
    image: "/images/reportImages/2024_report_sv2.png",
    displayLanguages: ["sv"],
    language: "sv",
  },
  {
    id: "2",
    title: "Bolagsklimatkollen 2024",
    slug: "bolags-klimatkollen-2024",
    date: "2024-06-01",
    excerpt: "En analys av 150 svenska storbolags klimatredovisning 2023",
    readTime: "15 min",
    category: "report",
    author: {
      name: "Alexandra Palmquist",
      avatar: "/people/alex.jpg",
    },
    link: "/reports/2024-06-Bolagsklimatkollen.pdf",
    image: "/images/reportImages/2023_bolagsklimatkollen2.png",
    displayLanguages: ["sv"],
    language: "sv",
  },
  {
    id: "3",
    title: "Corporate Climate Checker",
    slug: "corporate-climate-checker",
    date: "2024-08-01",
    excerpt:
      "An analysis of 150 major Swedish companies' climate reporting 2023",
    readTime: "15 min",
    category: "report",
    author: {
      name: "Alexandra Palmquist",
      avatar: "/people/alex.jpg",
    },
    link: "/reports/2024-08_CorporateClimateChecker.pdf",
    image: "/images/reportImages/2023_corportateclimatechecker2.png",
    displayLanguages: ["en"],
    language: "en",
  },
  {
    id: "4",
    title:
      "Typology of Data Quality Problems in the Corporate Reporting of GHG Emissions",
    slug: "typology-of-data-quality-problems-in-corporate-reporting-of-ghg-emissions",
    date: "2025-05-26",
    excerpt:
      "A typology of data quality problems in corporate reporting of GHG emissions. A report by Green Data, Indicators, Algorithms (Green DIA), funded by the Bavarian Research Institute for Digital Transformation (bidt) and Klimatkollen.",
    readTime: "15 min",
    category: "report",
    author: {
      name: "Green DIA",
    },
    link: "/reports/Typology_of_Data_Quality_Problems_in_Corporate_Reporting.docx.pdf",
    image: "/images/reportImages/typology-of-errors.png",
    displayLanguages: ["en", "all"],
    language: "en",
  },
  {
    id: "5",
    title: "Bolagsklimatkollen 2025",
    slug: "bolags-klimatkollen-2024",
    date: "2025-06-23",
    excerpt:
      "I årets version av rapporten Bolagsklimatkollen analyserar vi 235 storbolags klimatredovisning för 2024. Rapporten är ett samarbete mellan 2050 Consulting och Klimatkollen.",
    readTime: "15 min",
    category: "report",
    author: {
      name: "Frida Berry Eklund",
      avatar: "/people/frida.jpg",
    },
    link: "/reports/2025-06-23_Bolagsklimatkollen.pdf",
    image: "/images/reportImages/2024_bolagsklimatkollen.png",
    displayLanguages: ["sv", "all"],
    language: "sv",
  },
  {
    id: "6",
    title: "Applying Carbon Law From 2025",
    slug: "applying-carbon-law-from-2025",
    date: "2025-06-19",
    excerpt:
      "Summary of Klimatkollen's investigations for adjustments to the Carbon Law target trajectory, based on 2024 emissions and updated carbon budgets.",
    readTime: "7 min",
    category: "report",
    author: {
      name: "Frida Berry Eklund",
      avatar: "/people/frida.jpg",
    },
    link: "/reports/2025-06-19_ApplyingCarbonLawFrom2025.pdf",
    image: "/images/reportImages/2025_Carbon_Law.png",
    displayLanguages: ["en", "all"],
    language: "en",
  },
  {
    id: "7",
    title: "Klimatkollens klimatbokslut 2025",
    titleEn: "Klimatkollen climate statement 2025",
    slug: "klimatkollens-klimatbokslut-2025",
    legacyReportIds: [
      "2025-06-23_Klimatkollens_klimatpaverkan",
      "klimatkollens-klimatpaverkan-2025",
    ],
    date: "2026-06-22",
    excerpt:
      "En redovisning av Klimatkollens egna växthusgasutsläpp och klimatpåverkan för 2025.",
    excerptEn:
      "A report on Klimatkollen's own greenhouse gas emissions and climate impact for 2025.",
    readTime: "3 min",
    category: "report",
    author: {
      name: "Catharina Bratt",
      avatar: "/people/catharina.jpeg",
    },
    link: "/reports/2025_Klimatkollens_klimatbokslut_SV.pdf",
    linkEn: "/reports/2025_Klimatkollens_klimatbokslut_EN.pdf",
    image: "/images/reportImages/2025_klimatkollens_klimatpaverkan.png",
    displayLanguages: ["sv", "en"],
    language: "sv",
  },
];
