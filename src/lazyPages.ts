import { lazy } from "react";

export const AboutPage = lazy(() =>
  import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
export const BlogDetailPage = lazy(() =>
  import("./pages/BlogDetailPage").then((m) => ({ default: m.BlogDetailPage })),
);
export const CompanyEditPage = lazy(() =>
  import("./pages/CompanyEditPage").then((m) => ({
    default: m.CompanyEditPage,
  })),
);
export const CompanyDetailPage = lazy(() =>
  import("./pages/CompanyDetailPage").then((m) => ({
    default: m.CompanyDetailPage,
  })),
);
export const SectorsOverviewPage = lazy(() =>
  import("./pages/SectorsOverviewPage").then((m) => ({
    default: m.SectorsOverviewPage,
  })),
);
export const DownloadsPage = lazy(() => import("./pages/DownloadsPage"));
export const ErrorPage = lazy(() =>
  import("./pages/ErrorPage").then((m) => ({ default: m.ErrorPage })),
);
export const InsightsPage = lazy(() =>
  import("./pages/InsightsPage").then((m) => ({ default: m.InsightsPage })),
);
export const LearnMoreOverview = lazy(() =>
  import("./pages/LearnMoreOverview").then((m) => ({
    default: m.LearnMoreOverview,
  })),
);
export const LearnMoreArticle = lazy(() =>
  import("./pages/LearnMoreArticle").then((m) => ({
    default: m.LearnMoreArticle,
  })),
);
export const MethodsPage = lazy(() =>
  import("./pages/MethodsPage").then((m) => ({ default: m.MethodsPage })),
);
export const MunicipalitiesOverviewPage = lazy(() =>
  import("./pages/MunicipalitiesOverviewPage").then((m) => ({
    default: m.MunicipalitiesOverviewPage,
  })),
);
export const MunicipalityDetailPage = lazy(() =>
  import("./pages/MunicipalityDetailPage").then((m) => ({
    default: m.MunicipalityDetailPage,
  })),
);
export const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
export const ReportsPage = lazy(() =>
  import("./pages/ReportsPage").then((m) => ({ default: m.ReportsPage })),
);
export const PrivacyPage = lazy(() =>
  import("./pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })),
);
export const DataDownloadPage = lazy(() => import("./pages/DataDownloadPage"));
export const UnauthorizedErrorPage = lazy(() =>
  import("./pages/error/UnauthorizedErrorPage").then((m) => ({
    default: m.UnauthorizedErrorPage,
  })),
);
export const SupportPage = lazy(() =>
  import("./pages/SupportPage").then((m) => ({ default: m.SupportPage })),
);
export const ValidationDashboard = lazy(() =>
  import("./pages/internal-pages/ValidationDashboard").then((m) => ({
    default: m.ValidationDashboard,
  })),
);
export const InternalDashboard = lazy(() =>
  import("./pages/internal-pages/InternalDashboard").then((m) => ({
    default: m.InternalDashboard,
  })),
);
export const ReportLandingPage = lazy(() =>
  import("./pages/ReportLandingPage").then((m) => ({
    default: m.ReportLandingPage,
  })),
);
export const RequestsDashboard = lazy(() =>
  import("./pages/internal-pages/RequestsDashboard").then((m) => ({
    default: m.RequestsDashboard,
  })),
);
export const TrendAnalysisDashboard = lazy(() =>
  import("./pages/internal-pages/TrendAnalysisDashboard").then((m) => ({
    default: m.TrendAnalysisDashboard,
  })),
);
export const ParisAlignedStatisticsPage = lazy(() =>
  import("./pages/internal-pages/ParisAlignedStatisticsPage").then((m) => ({
    default: m.ParisAlignedStatisticsPage,
  })),
);
export const AddCompanyPage = lazy(() =>
  import("./pages/internal-pages/AddCompanyPage").then((m) => ({
    default: m.AddCompanyPage,
  })),
);
export const NewsLetterArchivePage = lazy(() =>
  import("./pages/NewslettersPage").then((m) => ({
    default: m.NewsLetterArchivePage,
  })),
);
export const RegionalOverviewPage = lazy(() =>
  import("./pages/RegionalOverviewPage").then((m) => ({
    default: m.RegionalOverviewPage,
  })),
);
export const RegionDetailPage = lazy(() =>
  import("./pages/RegionDetailPage").then((m) => ({
    default: m.RegionDetailPage,
  })),
);
export const NationDetailPage = lazy(() =>
  import("./pages/NationDetailPage").then((m) => ({
    default: m.NationDetailPage,
  })),
);
export const CompaniesOverviewPage = lazy(() =>
  import("./pages/CompaniesOverviewPage").then((m) => ({
    default: m.CompaniesOverviewPage,
  })),
);
export const ExplorePage = lazy(() =>
  import("./pages/ExplorePage").then((m) => ({ default: m.ExplorePage })),
);
