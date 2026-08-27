import { Route, Routes, Navigate } from "react-router-dom";
import { LanguageRedirect } from "@/components/LanguageRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import { useLanguage } from "./components/LanguageProvider";
import {
  AboutPage,
  AddCompanyPage,
  BlogDetailPage,
  CompaniesOverviewPage,
  CompanyDetailPage,
  DataDownloadPage,
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
  Valet2026Page,
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
  SectorDetailPage,
  SupportPage,
  TrendAnalysisDashboard,
  UnauthorizedErrorPage,
  ValidationDashboard,
} from "./lazyPages";
import { AuthCallback } from "./pages/AuthCallback";
import { LandingPage } from "./pages/LandingPage";
import { ComparisonRouteLayout } from "./components/compare/ComparisonRouteLayout";

function ComparisonRoutes({ basePath }: { basePath: string }) {
  return (
    <Route element={<ComparisonRouteLayout />}>
      <Route
        path={`${basePath}/explore/compare`}
        element={<ComparisonPage />}
      />
      <Route
        path={`${basePath}/explore/:mainFilter`}
        element={<ExplorePage />}
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
      <Route path={`${basePath}/regions/:id`} element={<RegionDetailPage />} />
      <Route
        path={`${basePath}/municipalities/:id`}
        element={<MunicipalityDetailPage />}
      />
    </Route>
  );
}

function CompanyRoutes({ basePath }: { basePath: string }) {
  return (
    <>
      <Route path={`${basePath}/sectors`} element={<SectorsOverviewPage />} />
      <Route
        path={`${basePath}/sectors/:code`}
        element={<SectorDetailPage />}
      />
      <Route
        path={`${basePath}/companies`}
        element={<CompaniesOverviewPage />}
      />
      <Route element={<ProtectedRoute />}>
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
      <Route path={`${basePath}/nation`} element={<Valet2026Page />} />
      <Route
        path={`${basePath}/valet-2026`}
        element={<Navigate to={`${basePath}/nation`} replace />}
      />
      <Route
        path={`${basePath}/municipalities`}
        element={<MunicipalitiesOverviewPage />}
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
        path={`${basePath}/data-download/database-download-2024`}
        element={<Navigate to={`${basePath}/data-download`} replace />}
      />
      <Route
        path={`${basePath}/data-download/database-download-2025`}
        element={<Navigate to={`${basePath}/data-download`} replace />}
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
      {ComparisonRoutes({ basePath })}
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
