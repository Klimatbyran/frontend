import { Route, Routes } from "react-router-dom";
import { stagingFeatureFlagEnabled } from "@/utils/ui/featureFlags";
import { LanguageRedirect } from "@/components/LanguageRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import StagingProtectedRoute from "./components/StagingProtectedRoute";
// StagingProtectedRoute: use when developing new pages that should only be visible on staging.
// Wrap the route(s) in <Route element={<StagingProtectedRoute />}> and nest your path(s) inside.
// When ready for prod, remove the wrapper. Keep this import so dead-code scripts don't remove the component.
import { useLanguage } from "./components/LanguageProvider";
import { AboutPage } from "./pages/AboutPage";
import { AuthCallback } from "./pages/AuthCallback";
import { BlogDetailPage } from "./pages/BlogDetailPage";
import { CompanyEditPage } from "./pages/CompanyEditPage";
import { CompanyDetailPage } from "./pages/CompanyDetailPage";
import { SectorsOverviewPage } from "./pages/SectorsOverviewPage";
import DownloadsPage from "./pages/DownloadsPage";
import { ErrorPage } from "./pages/ErrorPage";
import { InsightsPage } from "./pages/InsightsPage";
import { LandingPage } from "./pages/LandingPage";
import { LandingPageNew } from "./pages/LandingPageNew";
import { LearnMoreOverview } from "./pages/LearnMoreOverview";
import { LearnMoreArticle } from "./pages/LearnMoreArticle";
import { MethodsPage } from "./pages/MethodsPage";
import { MunicipalitiesOverviewPage } from "./pages/MunicipalitiesOverviewPage";
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
import { ParisAlignedStatisticsPage } from "./pages/internal-pages/ParisAlignedStatisticsPage";
import { AddCompanyPage } from "./pages/internal-pages/AddCompanyPage";
import { NewsLetterArchivePage } from "./pages/NewslettersPage";
import { RegionalOverviewPage } from "./pages/RegionalOverviewPage";
import { RegionDetailPage } from "./pages/RegionDetailPage";
import { CompaniesOverviewPage } from "./pages/CompaniesOverviewPage";
import { ExplorePage } from "./pages/ExplorePage";

void StagingProtectedRoute; // referenced so dead-code scripts keep the component; eslint/ts unused-import satisfied

// Conditional landing page component that shows new version on localhost/staging
function ConditionalLandingPage() {
  const isStaging = stagingFeatureFlagEnabled();
  return isStaging ? <LandingPageNew /> : <LandingPage />;
}

export function AppRoutes() {
  const { currentLanguage } = useLanguage();

  // Define base path based on language
  const basePath = currentLanguage === "sv" ? "/sv" : "/en";

  return (
    <Routes>
      {/* Language redirect for non-prefixed routes */}
      <Route path="*" element={<LanguageRedirect />} />

      {/* Root path - matches both /sv and /en */}
      <Route path={`${basePath}`} element={<ConditionalLandingPage />} />
      <Route path={`${basePath}/`} element={<ConditionalLandingPage />} />

      {/* General routes */}
      <Route
        path={`${basePath}/explore/:mainFilter`}
        element={<ExplorePage />}
      />

      {/* Strict companies routes */}
      <Route path={`${basePath}/sectors`} element={<SectorsOverviewPage />} />
      <Route
        path={`${basePath}/companies`}
        element={<CompaniesOverviewPage />}
      />
      <Route
        path={`${basePath}/companies/:id`}
        element={<CompanyDetailPage />}
      />
      <Route
        path={`${basePath}/companies/:id/:slug`}
        element={<CompanyDetailPage />}
      />
      <Route
        path={`${basePath}/foretag/:slug-:id`}
        element={<CompanyDetailPage />}
      />

      {/* Protected Routes*/}
      <Route element={<ProtectedRoute />}>
        <Route
          path={`${basePath}/companies/:id/edit`}
          element={<CompanyEditPage />}
        />
        <Route
          path={`${basePath}/internal-pages/validation-dashboard`}
          element={<ValidationDashboard />}
        />
        <Route
          path={`${basePath}/internal-pages/requests-dashboard`}
          element={<RequestsDashboard />}
        />
        <Route
          path={`${basePath}/internal-pages/internal-dashboard`}
          element={<InternalDashboard />}
        />
        <Route
          path={`${basePath}/internal-pages/trend-analysis-dashboard`}
          element={<TrendAnalysisDashboard />}
        />
        <Route
          path={`${basePath}/internal-pages/paris-aligned-statistics`}
          element={<ParisAlignedStatisticsPage />}
        />
        <Route
          path={`${basePath}/internal-pages/add-company`}
          element={<AddCompanyPage />}
        />
      </Route>

      {/* Strict regions routes */}
      <Route path={`${basePath}/regions`} element={<RegionalOverviewPage />} />
      <Route path={`${basePath}/regions/:id`} element={<RegionDetailPage />} />

      {/* Strict municipalities routes */}
      <Route
        path={`${basePath}/municipalities`}
        element={<MunicipalitiesOverviewPage />}
      />
      <Route
        path={`${basePath}/municipalities/:id`}
        element={<MunicipalityDetailPage />}
      />

      {/* About Pages */}
      <Route path={`${basePath}/about`} element={<AboutPage />} />
      <Route path={`${basePath}/methodology`} element={<MethodsPage />} />
      <Route path={`${basePath}/support`} element={<SupportPage />} />

      {/* Insights Pages */}
      <Route path={`${basePath}/articles`} element={<InsightsPage />} />
      <Route path={`${basePath}/reports`} element={<ReportsPage />} />
      <Route
        path={`${basePath}/reports/:reportId`}
        element={<ReportLandingPage />}
      />
      <Route path={`${basePath}/insights/:id`} element={<BlogDetailPage />} />
      <Route path={`${basePath}/learn-more`} element={<LearnMoreOverview />} />
      <Route
        path={`${basePath}/newsletter-archive`}
        element={<NewsLetterArchivePage />}
      />
      <Route
        path={`${basePath}/learn-more/:id`}
        element={<LearnMoreArticle />}
      />

      {/* Other Pages */}
      <Route path={`${basePath}/privacy`} element={<PrivacyPage />} />
      <Route path={`${basePath}/products`} element={<ProductsPage />} />
      <Route
        path={`${basePath}/products/database-download-2025`}
        element={<DownloadsPage />}
      />

      {/* Error pages */}
      <Route path={`${basePath}/error/:code`} element={<ErrorPage />} />

      {/* This catch-all should now only handle invalid routes */}
      <Route path={`${basePath}/*`} element={<NotFoundPage />} />
      <Route path={`${basePath}/403`} element={<UnauthorizedErrorPage />} />
      <Route path="auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}
