import { Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import { LanguageRedirect } from "@/components/LanguageRedirect";
import { LandingPage } from "./pages/LandingPage";

// Lazy load all pages except LandingPage for faster initial load
const AboutPage = lazy(() => import("./pages/AboutPage").then(m => ({ default: m.AboutPage })));
const AuthCallback = lazy(() => import("./pages/AuthCallback").then(m => ({ default: m.AuthCallback })));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage").then(m => ({ default: m.BlogDetailPage })));
const CompanyEditPage = lazy(() => import("./pages/CompanyEditPage").then(m => ({ default: m.CompanyEditPage })));
const CompanyDetailPage = lazy(() => import("./pages/CompanyDetailPage").then(m => ({ default: m.CompanyDetailPage })));
const CompaniesPage = lazy(() => import("./pages/CompaniesPage").then(m => ({ default: m.CompaniesPage })));
const DownloadsPage = lazy(() => import("./pages/DownloadsPage"));
const ErrorPage = lazy(() => import("./pages/ErrorPage").then(m => ({ default: m.ErrorPage })));
const InsightsPage = lazy(() => import("./pages/InsightsPage").then(m => ({ default: m.InsightsPage })));
const LearnMoreOverview = lazy(() => import("./pages/LearnMoreOverview").then(m => ({ default: m.LearnMoreOverview })));
const LearnMoreArticle = lazy(() => import("./pages/LearnMoreArticle").then(m => ({ default: m.LearnMoreArticle })));
const MethodsPage = lazy(() => import("./pages/MethodsPage").then(m => ({ default: m.MethodsPage })));
const MunicipalitiesRankedPage = lazy(() => import("./pages/MunicipalitiesRankedPage").then(m => ({ default: m.MunicipalitiesRankedPage })));
const MunicipalitiesComparePage = lazy(() => import("./pages/MunicipalitiesComparePage").then(m => ({ default: m.MunicipalitiesComparePage })));
const MunicipalityDetailPage = lazy(() => import("./pages/MunicipalityDetailPage").then(m => ({ default: m.MunicipalityDetailPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const ReportsPage = lazy(() => import("./pages/ReportsPage").then(m => ({ default: m.ReportsPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const UnauthorizedErrorPage = lazy(() => import("./pages/error/UnauthorizedErrorPage").then(m => ({ default: m.UnauthorizedErrorPage })));
const SupportPage = lazy(() => import("./pages/SupportPage").then(m => ({ default: m.SupportPage })));
const ValidationDashboard = lazy(() => import("./pages/internal-pages/ValidationDashboard").then(m => ({ default: m.ValidationDashboard })));
const InternalDashboard = lazy(() => import("./pages/internal-pages/InternalDashboard").then(m => ({ default: m.InternalDashboard })));
const ReportLandingPage = lazy(() => import("./pages/ReportLandingPage").then(m => ({ default: m.ReportLandingPage })));
const RequestsDashboard = lazy(() => import("./pages/internal-pages/RequestsDashboard").then(m => ({ default: m.RequestsDashboard })));
const TrendAnalysisDashboard = lazy(() => import("./pages/internal-pages/TrendAnalysisDashboard").then(m => ({ default: m.TrendAnalysisDashboard })));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-3"></div>
  </div>
);

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
      {/* Language redirect for non-prefixed routes */}
      <Route path="/" element={<LanguageRedirect />} />
      <Route path="/license" element={<LanguageRedirect />} />
      <Route path="/privacy" element={<LanguageRedirect />} />
      <Route path="/insights/:id" element={<LanguageRedirect />} />

      {/* Swedish routes */}
      <Route path="/sv" element={<LandingPage />} />
      <Route path="/sv/" element={<LandingPage />} />

      {/* Companies routes - Swedish */}
      <Route path="/sv/companies" element={<CompaniesPage />} />
      <Route path="/sv/companies/:id" element={<CompanyDetailPage />} />
      <Route path="/sv/companies/:id/:slug" element={<CompanyDetailPage />} />
      <Route path="/sv/foretag/:slug/:id" element={<CompanyDetailPage />} />

      {/* Protected Routes - Swedish */}
      <Route element={<ProtectedRoute />}>
        <Route path="/sv/companies/:id/edit" element={<CompanyEditPage />} />
        <Route path="/sv/internal-pages/validation-dashboard" element={<ValidationDashboard />} />
        <Route path="/sv/internal-pages/requests-dashboard" element={<RequestsDashboard />} />
        <Route path="/sv/internal-pages/internal-dashboard" element={<InternalDashboard />} />
        <Route path="/sv/internal-pages/trend-analysis-dashboard" element={<TrendAnalysisDashboard />} />
      </Route>

      {/* Municipalities routes - Swedish */}
      <Route path="/sv/municipalities" element={<MunicipalitiesRankedPage />} />
      <Route path="/sv/municipalities/explore" element={<MunicipalitiesComparePage />} />
      <Route path="/sv/municipalities/:id" element={<MunicipalityDetailPage />} />

      {/* About Pages - Swedish */}
      <Route path="/sv/about" element={<AboutPage />} />
      <Route path="/sv/methodology" element={<MethodsPage />} />
      <Route path="/sv/support" element={<SupportPage />} />

      {/* Insights Pages - Swedish */}
      <Route path="/sv/articles" element={<InsightsPage />} />
      <Route path="/sv/reports" element={<ReportsPage />} />
      <Route path="/sv/reports/:reportId" element={<ReportLandingPage />} />
      <Route path="/sv/insights/:id" element={<BlogDetailPage />} />
      <Route path="/sv/learn-more" element={<LearnMoreOverview />} />
      <Route path="/sv/learn-more/:id" element={<LearnMoreArticle />} />

      {/* Other Pages - Swedish */}
      <Route path="/sv/privacy" element={<PrivacyPage />} />
      <Route path="/sv/products" element={<ProductsPage />} />
      <Route path="/sv/products/database-download-2025" element={<DownloadsPage />} />

      {/* Error pages - Swedish */}
      <Route path="/sv/error/:code" element={<ErrorPage />} />
      <Route path="/sv/403" element={<UnauthorizedErrorPage />} />

      {/* English routes */}
      <Route path="/en" element={<LandingPage />} />
      <Route path="/en/" element={<LandingPage />} />

      {/* Companies routes - English */}
      <Route path="/en/companies" element={<CompaniesPage />} />
      <Route path="/en/companies/:id" element={<CompanyDetailPage />} />
      <Route path="/en/companies/:id/:slug" element={<CompanyDetailPage />} />

      {/* Protected Routes - English */}
      <Route element={<ProtectedRoute />}>
        <Route path="/en/companies/:id/edit" element={<CompanyEditPage />} />
        <Route path="/en/internal-pages/validation-dashboard" element={<ValidationDashboard />} />
        <Route path="/en/internal-pages/requests-dashboard" element={<RequestsDashboard />} />
        <Route path="/en/internal-pages/internal-dashboard" element={<InternalDashboard />} />
        <Route path="/en/internal-pages/trend-analysis-dashboard" element={<TrendAnalysisDashboard />} />
      </Route>

      {/* Municipalities routes - English */}
      <Route path="/en/municipalities" element={<MunicipalitiesRankedPage />} />
      <Route path="/en/municipalities/explore" element={<MunicipalitiesComparePage />} />
      <Route path="/en/municipalities/:id" element={<MunicipalityDetailPage />} />

      {/* About Pages - English */}
      <Route path="/en/about" element={<AboutPage />} />
      <Route path="/en/methodology" element={<MethodsPage />} />
      <Route path="/en/support" element={<SupportPage />} />

      {/* Insights Pages - English */}
      <Route path="/en/articles" element={<InsightsPage />} />
      <Route path="/en/reports" element={<ReportsPage />} />
      <Route path="/en/reports/:reportId" element={<ReportLandingPage />} />
      <Route path="/en/insights/:id" element={<BlogDetailPage />} />
      <Route path="/en/learn-more" element={<LearnMoreOverview />} />
      <Route path="/en/learn-more/:id" element={<LearnMoreArticle />} />

      {/* Other Pages - English */}
      <Route path="/en/privacy" element={<PrivacyPage />} />
      <Route path="/en/products" element={<ProductsPage />} />
      <Route path="/en/products/database-download-2025" element={<DownloadsPage />} />

      {/* Error pages - English */}
      <Route path="/en/error/:code" element={<ErrorPage />} />
      <Route path="/en/403" element={<UnauthorizedErrorPage />} />

      {/* Auth callback */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Catch-all for 404 */}
      <Route path="*catchAll" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
