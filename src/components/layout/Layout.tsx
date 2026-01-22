import { ReactNode, useEffect, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getCompanies, getMunicipalities } from "@/lib/api";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";
import { SuggestEdit } from "./SuggestEdit";
import { Seo } from "@/components/SEO/Seo";
import { getSeoForRoute } from "@/seo/routes";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();

  // Get SEO metadata for current route
  const seoMeta = useMemo(() => {
    return getSeoForRoute(location.pathname, params as Record<string, string>);
  }, [location.pathname, params]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["companies"],
      queryFn: getCompanies,
    });

    queryClient.prefetchQuery({
      queryKey: ["municipalities"],
      queryFn: getMunicipalities,
    });
  }, [queryClient]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black-3 flex flex-col">
      <Seo meta={seoMeta} />
      <Header />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 min-h-0">
        {children}
        <ScrollToTop />
        <SuggestEdit />
      </main>
      <Footer />
    </div>
  );
}
