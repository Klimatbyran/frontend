import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getCompanies, getMunicipalities } from "@/lib/api";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";
import { SuggestEdit } from "./SuggestEdit";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const queryClient = useQueryClient();

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
