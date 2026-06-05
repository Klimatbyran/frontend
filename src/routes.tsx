import { Route, Routes, Navigate } from "react-router-dom";
import { LanguageRedirect } from "@/components/LanguageRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import StagingProtectedRoute from "./components/StagingProtectedRoute";
// StagingProtectedRoute: use when developing new pages that should only be visible on staging.
// Wrap the route(s) in <Route element={<StagingProtectedRoute />}> and nest your path(s) inside.
// When ready for prod, remove the wrapper. Keep this import so dead-code scripts don't remove the component.
import { useLanguage } from "./components/LanguageProvider";
import {
  AboutPage,
  AddCompanyPage,
  BlogDetailPage,
  CompaniesOverviewPage,
  CompanyDetailPage,
  CompanyEditPage,
  DataDownloadPage,
  DownloadsPage,
  ErrorPage,
  ExplorePage,
  ComparisonPage,
  InsightsPage,
  InternalDashboard,
  LearnMoreArticle,
  LearnMoreOverview,
  MethodsPage,
  MunicipalitiesOverviewPage,
  MunicipalityDetailPage,
  NationDetailPage,
  NewsLetterArchivePage,
  NotFoundPage,
  ParisAlignedStatisticsPage,
  PrivacyPage,
  RegionalOverviewPage,
  RegionDetailPage,
  ReportLandingPage,
  ReportsPage,
  RequestsDashboard,
  SectorsOverviewPage,
  SupportPage,
  TrendAnalysisDashboard,
  UnauthorizedErrorPage,
  ValidationDashboard,
} from "./lazyPages";
import { AuthCallback } from "./pages/AuthCallback";
import { LandingPage } from "./pages/LandingPage";

void StagingProtectedRoute; // referenced so dead-code scripts keep the component; eslint/ts unused-import satisfied

function CompanyRoutes({ basePath }: { basePath: string }) {
  return (
    <>
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
    </>
  );
}

function TerritoryRoutes({ basePath }: { basePath: string }) {
  return (
    <>
      <Route path={`${basePath}/regions`} element={<RegionalOverviewPage />} />
      <Route path={`${basePath}/regions/:id`} element={<RegionDetailPage />} />
      <Route path={`${basePath}/nation`} element={<NationDetailPage />} />
      <Route
        path={`${basePath}/municipalities`}
        element={<MunicipalitiesOverviewPage />}
      />
      <Route
        path={`${basePath}/municipalities/:id`}
        element={<MunicipalityDetailPage />}
      />
    </>
  );
}

function ContentRoutes({ basePath }: { basePath: string }) {
  return (
    <>
      <Route path={`${basePath}/about`} element={<AboutPage />} />
      <Route path={`${basePath}/methodology`} element={<MethodsPage />} />
      <Route path={`${basePath}/support`} element={<SupportPage />} />
      <Route path={`${basePath}/articles`} element={<InsightsPage />} />
      <Route path={`${basePath}/reports`} element={<ReportsPage />} />
      <Route
        path={`${basePath}/reports/:reportId`}
        element={<ReportLandingPage />}
      />
      <Route path={`${basePath}/insights/:id`} element={<BlogDetailPage />} />
      <Route path={`${basePath}/learn-more`} element={<LearnMoreOverview />} />
      <Route
        path={`${basePath}/learn-more/:id`}
        element={<LearnMoreArticle />}
      />
      <Route
        path={`${basePath}/newsletter-archive`}
        element={<NewsLetterArchivePage />}
      />
      <Route path={`${basePath}/privacy`} element={<PrivacyPage />} />
      <Route
        path={`${basePath}/data-download`}
        element={<DataDownloadPage />}
      />
      <Route
        path={`${basePath}/data-download/database-download-2025`}
        element={<DownloadsPage />}
      />
    </>
  );
}

export function AppRoutes() {
  const { currentLanguage } = useLanguage();
  const basePath = currentLanguage === "sv" ? "/sv" : "/en";

  return (
    <Routes>
      <Route path="*" element={<LanguageRedirect />} />
      <Route path={`${basePath}`} element={<LandingPage />} />
      <Route path={`${basePath}/`} element={<LandingPage />} />
      <Route
        path={`${basePath}/explore`}
        element={<Navigate to={`${basePath}/explore/municipalities`} replace />}
      />
      <Route
        path={`${basePath}/explore/compare`}
        element={<ComparisonPage />}
      />
      <Route
        path={`${basePath}/explore/:mainFilter`}
        element={<ExplorePage />}
      />
      {CompanyRoutes({ basePath })}
      {TerritoryRoutes({ basePath })}
      {ContentRoutes({ basePath })}
      <Route path={`${basePath}/error/:code`} element={<ErrorPage />} />
      <Route path={`${basePath}/*`} element={<NotFoundPage />} />
      <Route path={`${basePath}/403`} element={<UnauthorizedErrorPage />} />
      <Route path="auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}
