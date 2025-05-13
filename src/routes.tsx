import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import { useLanguage } from "./components/LanguageProvider";
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

export function AppRoutes() {
  const { currentLanguage } = useLanguage();

  // Define base path based on language
  const basePath = currentLanguage === "sv" ? "/sv" : "/en";

  // Log for debugging
  useEffect(() => {
    console.log(`Current language: ${currentLanguage}, base path: ${basePath}`);
  }, [currentLanguage, basePath]);

  return (
    <Routes>
      {/* Language redirect for non-prefixed routes */}
      <Route path="*" element={<LanguageRedirect />} />

      {/* Root path - matches both /sv and /en */}
      <Route path={`${basePath}`} element={<LandingPage />} />
      <Route path={`${basePath}/`} element={<LandingPage />} />

      {/* Companies routes */}
      <Route path={`${basePath}/companies`} element={<CompaniesPage />} />
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
      </Route>

      {/* Municipalities routes */}
      <Route
        path={`${basePath}/municipalities`}
        element={<MunicipalitiesRankedPage />}
      />
      <Route
        path={`${basePath}/municipalities/compare`}
        element={<MunicipalitiesComparePage />}
      />
      <Route
        path={`${basePath}/municipalities/:id`}
        element={<MunicipalityDetailPage />}
      />

      {/* Other pages */}
      <Route path={`${basePath}/about`} element={<AboutPage />} />
      <Route path={`${basePath}/methodology`} element={<MethodsPage />} />
      <Route path={`${basePath}/support`} element={<SupportPage />} />
      <Route path={`${basePath}/articles`} element={<InsightsPage />} />
      <Route path={`${basePath}/reports`} element={<ReportsPage />} />
      <Route path={`${basePath}/insights/:id`} element={<BlogDetailPage />} />
      <Route path={`${basePath}/learn-more`} element={<LearnMoreOverview />} />
      <Route
        path={`${basePath}/learn-more/:id`}
        element={<LearnMoreArticle />}
      />
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
