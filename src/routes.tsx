import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { LanguageRedirect } from "@/components/LanguageRedirect";
import { AboutPage } from "./pages/AboutPage";
import { AuthCallback } from "./pages/AuthCallback";
import { BlogDetailPage } from "./pages/BlogDetailPage";
import { CompanyEditPage } from "./pages/CompanyEditPage";
import { CompanyDetailPage } from "./pages/CompanyDetailPage";
import { CompaniesPage } from "./pages/CompaniesPage";
import DownloadsPage from "./pages/DownloadsPage";
import { ErrorPage } from "./pages/ErrorPage";
import { InsightsPage } from "./pages/InsightsPage";
import { LandingPage } from "./pages/LandingPage";
import { LearnMoreOverview } from "./pages/LearnMoreOverview";
import { LearnMoreArticle } from "./pages/LearnMoreArticle";
import { MethodsPage } from "./pages/MethodsPage";
import { MunicipalitiesRankedPage } from "./pages/MunicipalitiesRankedPage";
import { MunicipalitiesComparePage } from "./pages/MunicipalitiesComparePage";
import { MunicipalityDetailPage } from "./pages/MunicipalityDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ReportsPage } from "./pages/ReportsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import ProductsPage from "./pages/ProductsPage";
import { UnauthorizedErrorPage } from "./pages/error/UnauthorizedErrorPage";
import { SupportPage } from "./pages/SupportPage";
import { ValidationDashboard } from "./pages/internal-pages/ValidationDashboard";
import { InternalDashboard } from "./pages/internal-pages/InternalDashboard";
import { ReportLandingPage } from "./pages/ReportLandingPage";
import { RequestsDashboard } from "./pages/internal-pages/RequestsDashboard";
import { TrendAnalysisDashboard } from "./pages/internal-pages/TrendAnalysisDashboard";

export function AppRoutes() {
  return (
    <Routes>
      {/* Language redirect for non-prefixed routes */}
      <Route path="/" element={<LanguageRedirect />} />
      <Route path="/license" element={<LanguageRedirect />} />
      <Route path="/privacy" element={<LanguageRedirect />} />

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
  );
}
